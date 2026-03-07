import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { DatabasePool } from "../../db/create-mysql-pool.js";
import type { PoolConnection } from "mysql2/promise";
import type {
  CreateUiDeviceInput,
  UiDeviceRecord,
  UpdateUiDeviceInput,
} from "./ui-types.js";

interface UiDeviceRow extends RowDataPacket {
  id: number;
  userId: number | null;
  placeId: number | null;
  deviceKey: string;
  lastAccess: string | null;
  notes: string | null;
  battery: number | null;
  sleepDuration: number;
  activityNumber: number;
  recentEventTime: string | null;
  recentEventId: number | null;
  checkInterval: number;
}

export interface UiRepositories {
  listDevices(): Promise<UiDeviceRecord[]>;
  findDeviceById(id: number): Promise<UiDeviceRecord | null>;
  createDevice(connection: PoolConnection, input: CreateUiDeviceInput): Promise<number>;
  updateDevice(connection: PoolConnection, input: UpdateUiDeviceInput): Promise<void>;
  deleteDevice(connection: PoolConnection, id: number): Promise<boolean>;
}

export function createUiRepositories(pool: DatabasePool): UiRepositories {
  return {
    async listDevices() {
      const [rows] = await pool.query<UiDeviceRow[]>(
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
            d.check_interval AS checkInterval
          FROM devices d
          ORDER BY d.id ASC
        `,
      );

      return rows.map(mapUiDeviceRow);
    },

    async findDeviceById(id) {
      const [rows] = await pool.query<UiDeviceRow[]>(
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
            d.check_interval AS checkInterval
          FROM devices d
          WHERE d.id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] ? mapUiDeviceRow(rows[0]) : null;
    },

    async createDevice(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO devices (notes, device_key) VALUES (?, ?)",
        [normalizeNotes(input.notes), input.deviceKey],
      );

      return result.insertId;
    },

    async updateDevice(connection, input) {
      await connection.execute<ResultSetHeader>(
        "UPDATE devices SET notes = ?, device_key = ? WHERE id = ?",
        [normalizeNotes(input.notes), input.deviceKey, input.id],
      );
    },

    async deleteDevice(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM devices WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },
  };
}

function mapUiDeviceRow(row: UiDeviceRow): UiDeviceRecord {
  return {
    id: row.id,
    userId: row.userId,
    placeId: row.placeId,
    deviceKey: row.deviceKey,
    lastAccess: row.lastAccess,
    notes: row.notes,
    battery: row.battery,
    sleepDuration: row.sleepDuration,
    activityNumber: row.activityNumber,
    recentEventTime: row.recentEventTime,
    recentEventId: row.recentEventId,
    checkInterval: row.checkInterval,
  };
}

function normalizeNotes(notes?: string): string {
  return notes?.trim() ?? "";
}
