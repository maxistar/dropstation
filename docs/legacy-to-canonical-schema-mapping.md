# Legacy to Canonical Schema Mapping

This document describes how the aligned MySQL schema maps the legacy Dropstation database model to the canonical OpenAPI model.

## Migration Strategy

The schema alignment is additive.

- legacy tables remain in place for the current PHP runtime
- canonical tables are added alongside them
- legacy data is backfilled into canonical structures during bootstrap
- synchronization beyond the initial backfill is expected to move into backend application logic

The current bootstrap sequence applies:

1. `backend/inc/sql/dump231001.sql`
2. `backend/inc/sql/mysql8_compat.sql`
3. `backend/inc/sql/20250802_add_more_fields.sql`
4. `backend/inc/sql/20260307_align_openapi_schema.sql`

## Entity Mapping

| Canonical entity | Canonical storage | Legacy source | Notes |
|---|---|---|---|
| `Plant` | `plants` | `points.notes`, `points.watering_value`, `devices.place_id`, `places.name` | One plant is backfilled per legacy point for MVP 1:1 mapping. |
| `Point` | `points` | `points` | `points.plant_id` links the physical point to the canonical plant. |
| `Device` | `devices` | `devices`, `users.timezone` | Device remains a legacy base table with canonical-compatible telemetry fields. |
| `Tank` | `tanks`, `tank_devices` | `capacitors`, `points.capacity_id` | Legacy capacitor rows seed canonical tank capacity and level; device connectivity is inferred from points. |
| `Schedule` | `schedule` | `schedule` | Legacy schedule rows are extended in place with canonical fields. |
| `Event` | `events_canonical` | `events`, `points` | Legacy watering events are copied into the canonical event store with `legacy_event_id`. |
| `Command` | `commands` | none | Commands are a new canonical persistence concept. |

## Detailed Rules

### Plants

- `plants.external_id` is backfilled as `pl_legacy_<point-id>`
- `plants.name` comes from `points.notes`, or falls back to `Plant <id>`
- `plants.location` comes from `places.name` through the point's device
- `plants.target_watering_duration_sec` is seeded from `points.watering_value`
- `points.plant_id` is filled by matching each point to its backfilled plant row

This is intentionally lossy. Species and humidity policy fields do not exist in the legacy schema and remain nullable until new backend flows populate them.

### Tanks

- `tanks.external_id` is backfilled as `tk_legacy_<capacitor-id>`
- `tanks.capacity_ml` comes from `capacitors.capacity`
- `tanks.current_level_ml` comes from `capacitors.value`
- `tanks.zone_id` is seeded as `zone_capacity_<capacitor-id>` because the legacy schema has no true hydraulic zone entity
- `tank_devices` is backfilled by joining `capacitors` to `points.capacity_id` and then to `points.device_id`

The legacy `points.capacity_id` column remains in place for PHP compatibility.

### Schedules

The existing `schedule` table is extended with canonical fields:

- `external_id`
- `plant_id`
- `recurrence`
- `active_from`
- `active_until`
- `enabled`
- `created_at`
- `updated_at`

Backfill rules:

- `schedule.external_id` is seeded as `sc_legacy_<schedule-id>`
- any legacy `lighting` event type is normalized to `insolation`
- `schedule.plant_id` is derived from the linked point where possible

### Events

Legacy compatibility handling is explicit:

- the legacy `events` table remains untouched for the PHP runtime
- the canonical event history is stored in `events_canonical`
- each copied legacy watering event stores:
  - `legacy_event_id`
  - `event_type = 'watering'`
  - canonical `device_id`, `point_id`, and `plant_id` where available

This means the migration period uses:

```text
legacy PHP runtime -> writes legacy events
new backend/runtime -> can read canonical events
```

During transition, future backend code should dual-write or explicitly project new events into `events_canonical` rather than mutating legacy event semantics in place.

### Commands

`commands` is a new canonical table for accepted user-initiated actions. It is not backfilled because the legacy schema has no equivalent command history.

## Compatibility Assumptions

- legacy PHP watering endpoints continue to read/write `devices`, `points`, `capacitors`, `users`, and legacy `events`
- additive canonical tables must not remove or rename legacy columns used by PHP
- legacy numeric IDs remain internal primary keys
- canonical APIs can expose stable external IDs using `external_id` columns where added

## Known Limits

- plant metadata backfill is incomplete because the legacy schema has no real plant table
- hydraulic zone identity is synthetic until a richer zone model exists
- legacy watering events only represent a subset of the canonical event taxonomy
- full ongoing synchronization between legacy and canonical stores is an application-layer responsibility, not a SQL-trigger responsibility
