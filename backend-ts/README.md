# Dropstation TypeScript Backend

This service is the primary backend going forward for Dropstation.

The legacy PHP backend still exists during transition, but new backend implementation should land here first.

## Scope

Current direction:

- TypeScript backend is the main implementation target
- PHP backend remains available as a legacy backend during coexistence
- the first migrated slice is the runtime/device watering workflow

## Local Development

From `dropstation/backend-ts`:

1. Install dependencies:

```bash
npm install
```

2. Start the Dropstation MySQL and PHP stack if needed:

```bash
cd ..
docker compose up -d db web phpmyadmin
bash scripts/bootstrap-mysql8.sh
```

3. Create your local environment file:

```bash
cp .env.example .env
```

4. Run the TypeScript backend:

```bash
npm run dev
```

The service loads variables from `.env`. The example file is set up for running `backend-ts` on the host machine against the Dockerized MySQL instance:

- `HOST=0.0.0.0`
- `PORT=3001`
- `CORS_ORIGIN=http://localhost:3000`
- `CORS_ADDITIONAL_ORIGIN=http://localhost:4200`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3307`
- `DB_NAME=dropstation`
- `DB_USER=root`
- `DB_PASSWORD=gotechnies`
- `AUTH_TOKEN_SECRET=change-me-in-production`
- `AUTH_TOKEN_TTL_SECONDS=28800`

If you later run the TypeScript backend inside Docker on the same Compose network, switch DB settings to `DB_HOST=db` and `DB_PORT=3306`.

The backend allows browser requests from configured origins. Set either:
- `CORS_ORIGIN` + `CORS_ADDITIONAL_ORIGIN`, or
- `CORS_ORIGINS` as a comma-separated list (takes precedence).

For local development, keep Nuxt and Angular origins in the allowlist.

## Local Auth User Provisioning

UI login is DB-backed and reads from table `users` (`login` OR `email`, `password_hash`, `active`).

`scripts/bootstrap-mysql8.sh` applies `backend/inc/sql/20260308_add_user_auth_fields.sql` and seeds this local dev user:

- `login=admin`
- `email=admin@example.com`
- password: `admin`
- `active=1`

Generate a new scrypt password hash for custom users:

```bash
npm run hash:password -- "<your-password>"
```

Example SQL for creating a custom active user:

```sql
INSERT INTO users (login, timezone, email, password_hash, active)
VALUES ('myuser', 'UTC', 'myuser@example.com', '<hash-from-command>', 1);
```

## Dashboard API (Angular)

Dashboard-focused UI endpoints:

- `GET /api/ui/v1/dashboard/plants`: returns dashboard plant cards/counter data
- `GET /api/ui/v1/dashboard/water-tank`: returns dashboard tank status
- `POST /api/ui/v1/dashboard/plants/:id/water`: triggers watering for the plant and returns `{ "success": true }`

Password authorization endpoints:

- `POST /api/ui/v1/auth/login`: accepts `{ "username": "...", "password": "..." }` and returns bearer token payload
- `POST /api/ui/v1/auth/logout`: local logout acknowledgment endpoint

Protected endpoints in this iteration:

- `/api/ui/v1/devices` (+ by-id/create/update/delete)
- `/api/ui/v1/capacitors` (+ by-id/create/update/delete)
- `/api/ui/v1/places` (+ by-id/create/update/delete)
- `/api/ui/v1/plants` (+ by-id/create/update/delete)
- `/api/ui/v1/points` (+ by-id/create/update/delete)
- `/api/ui/v1/dashboard/plants`
- `/api/ui/v1/dashboard/water-tank`
- `/api/ui/v1/dashboard/plants/:id/water`

## Validation

Basic checks:

```bash
npm run check
npm run test
```

Runtime endpoint shape:

```bash
curl "http://localhost:3001/api/device/v1/watering?device=1a382ff4-5099-4be1-9e48-71eb7c36db27"
```

UI/admin endpoint shapes used by Nuxt:

```bash
TOKEN=$(curl -sS -X POST "http://localhost:3001/api/ui/v1/auth/login" \
  -H "content-type: application/json" \
  -d '{"username":"admin","password":"admin"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
```

Use `Authorization: Bearer $TOKEN` for protected routes:

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/devices"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/capacitors"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/places"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/plants"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/points"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/dashboard/plants"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ui/v1/dashboard/water-tank"
```

Device create/update payload required by Nuxt device admin:

```json
{
  "deviceKey": "dev-7",
  "notes": "Greenhouse controller",
  "sleepDuration": 3600,
  "activityNumber": 2,
  "checkInterval": 900
}
```

## Coexistence with PHP

- PHP remains available as the legacy backend during transition
- TypeScript is the primary backend implementation target
- behavior can be compared against the PHP runtime while migration continues
- the long-term goal is to retire the PHP backend after the TypeScript backend covers the required workflows
- Nuxt now consumes migrated device, point, capacitor, place, and plant admin flows through `backend-ts` rather than Nuxt-local SQL handlers
