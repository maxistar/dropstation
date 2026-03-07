import type { RowDataPacket } from "mysql2";
import type { DatabasePool } from "../../db/create-mysql-pool.js";
import type {
  CanonicalEventRecord,
  RuntimeDeviceRecord,
  RuntimePointRecord,
  RuntimeScheduleRecord,
} from "./runtime-types.js";

type DeviceRow = RowDataPacket & RuntimeDeviceRecord;
type PointRow = RowDataPacket & RuntimePointRecord;
type ScheduleRow = RowDataPacket & RuntimeScheduleRecord;
type EventRow = RowDataPacket & CanonicalEventRecord;

export interface RuntimeRepositories {
  findDeviceByKey(deviceKey: string): Promise<RuntimeDeviceRecord | null>;
  listPointsByDeviceId(deviceId: number): Promise<RuntimePointRecord[]>;
  listSchedulesByDeviceId(deviceId: number): Promise<RuntimeScheduleRecord[]>;
  listRecentCanonicalEventsByDeviceId(
    deviceId: number,
    limit?: number,
  ): Promise<CanonicalEventRecord[]>;
}

export function createRuntimeRepositories(
  pool: DatabasePool,
): RuntimeRepositories {
  return {
    async findDeviceByKey(deviceKey) {
      const [rows] = await pool.query<DeviceRow[]>(
        `
          SELECT
            d.id,
            d.user_id AS userId,
            d.place_id AS placeId,
            d.device_key AS deviceKey,
            d.last_access AS lastAccess,
            d.notes,
            d.battery,
            d.sleep_duration AS sleepDuration,
            d.activity_number AS activityNumber,
            d.recent_event_time AS recentEventTime,
            d.recent_event_id AS recentEventId,
            d.check_interval AS checkInterval,
            u.timezone
          FROM devices d
          JOIN users u ON u.id = d.user_id
          WHERE d.device_key = ?
          LIMIT 1
        `,
        [deviceKey],
      );

      return rows[0] ?? null;
    },

    async listPointsByDeviceId(deviceId) {
      const [rows] = await pool.query<PointRow[]>(
        `
          SELECT
            id,
            user_id AS userId,
            device_id AS deviceId,
            plant_id AS plantId,
            capacity_id AS capacityId,
            last_watering AS lastWatering,
            notes,
            watering_type AS wateringType,
            watering_value AS wateringValue,
            watering_hour AS wateringHour,
            num AS \`index\`,
            address,
            status,
            humidity
          FROM points
          WHERE device_id = ?
          ORDER BY num
        `,
        [deviceId],
      );

      return rows;
    },

    async listSchedulesByDeviceId(deviceId) {
      const [rows] = await pool.query<ScheduleRow[]>(
        `
          SELECT
            id,
            external_id AS externalId,
            hour,
            minute,
            event_type AS eventType,
            device_id AS deviceId,
            point_id AS pointId,
            plant_id AS plantId,
            duration,
            recurrence,
            active_from AS activeFrom,
            active_until AS activeUntil,
            enabled
          FROM schedule
          WHERE device_id = ?
          ORDER BY hour, minute, id
        `,
        [deviceId],
      );

      return rows;
    },

    async listRecentCanonicalEventsByDeviceId(deviceId, limit = 50) {
      const [rows] = await pool.query<EventRow[]>(
        `
          SELECT
            id,
            external_id AS externalId,
            legacy_event_id AS legacyEventId,
            event_type AS eventType,
            occurred_at AS occurredAt,
            device_id AS deviceId,
            point_id AS pointId,
            plant_id AS plantId,
            amount_ml AS amountMl,
            duration_sec AS durationSec,
            humidity,
            status,
            payload
          FROM events_canonical
          WHERE device_id = ?
          ORDER BY occurred_at DESC, id DESC
          LIMIT ?
        `,
        [deviceId, limit],
      );

      return rows;
    },
  };
}
