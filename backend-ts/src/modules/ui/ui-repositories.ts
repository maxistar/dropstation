import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { DatabasePool } from "../../db/create-mysql-pool.js";
import type { PoolConnection } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import type {
  CreateUiCapacitorInput,
  CreateUiDeviceInput,
  CreateUiPlantInput,
  CreateUiPlaceInput,
  CreateUiPointInput,
  DashboardPlantRecord,
  DashboardTankRecord,
  UiCapacitorRecord,
  UiDeviceRecord,
  UiPlantRecord,
  UiPlaceRecord,
  UiPointRecord,
  UpdateUiCapacitorInput,
  UpdateUiDeviceInput,
  UpdateUiPlantInput,
  UpdateUiPlaceInput,
  UpdateUiPointInput,
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

interface UiPointRow extends RowDataPacket {
  id: number;
  userId: number | null;
  deviceId: number;
  plantId: number | null;
  capacityId: number | null;
  lastWatering: string | null;
  notes: string | null;
  wateringType: number;
  wateringValue: number;
  wateringHour: number;
  index: number;
  address: string | null;
  status: string | null;
  humidity: number | null;
}

interface UiCapacitorRow extends RowDataPacket {
  id: number;
  userId: number | null;
  capacity: number;
  value: number;
}

interface UiPlaceRow extends RowDataPacket {
  id: number;
  userId: number | null;
  index: number;
  name: string;
}

interface UiPlantRow extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  species: string | null;
  location: string | null;
  targetHumidityMin: number | null;
  targetHumidityMax: number | null;
  targetWateringDurationSec: number | null;
  active: number;
}

interface DashboardPlantRow extends RowDataPacket {
  id: number;
  name: string | null;
  type: string | null;
  location: string | null;
  soilHumidity: number | null;
  lastWatered: string | null;
  wateringDuration: number | null;
  targetHumidityMin: number | null;
  targetHumidityMax: number | null;
}

interface DashboardTankRow extends RowDataPacket {
  id: number;
  capacityMl: number;
  currentLevelMl: number;
  lastRefilledAt: string | null;
}

export interface UiRepositories {
  listDevices(): Promise<UiDeviceRecord[]>;
  findDeviceById(id: number): Promise<UiDeviceRecord | null>;
  listPoints(): Promise<UiPointRecord[]>;
  listCapacitors(): Promise<UiCapacitorRecord[]>;
  findCapacitorById(id: number): Promise<UiCapacitorRecord | null>;
  findPointById(id: number): Promise<UiPointRecord | null>;
  listPlaces(): Promise<UiPlaceRecord[]>;
  findPlaceById(id: number): Promise<UiPlaceRecord | null>;
  listPlants(): Promise<UiPlantRecord[]>;
  findPlantById(id: number): Promise<UiPlantRecord | null>;
  createDevice(connection: PoolConnection, input: CreateUiDeviceInput): Promise<number>;
  updateDevice(connection: PoolConnection, input: UpdateUiDeviceInput): Promise<void>;
  deleteDevice(connection: PoolConnection, id: number): Promise<boolean>;
  createCapacitor(connection: PoolConnection, input: CreateUiCapacitorInput): Promise<number>;
  updateCapacitor(connection: PoolConnection, input: UpdateUiCapacitorInput): Promise<void>;
  deleteCapacitor(connection: PoolConnection, id: number): Promise<boolean>;
  createPoint(connection: PoolConnection, input: CreateUiPointInput): Promise<number>;
  updatePoint(connection: PoolConnection, input: UpdateUiPointInput): Promise<void>;
  deletePoint(connection: PoolConnection, id: number): Promise<boolean>;
  createPlace(connection: PoolConnection, input: CreateUiPlaceInput): Promise<number>;
  updatePlace(connection: PoolConnection, input: UpdateUiPlaceInput): Promise<void>;
  deletePlace(connection: PoolConnection, id: number): Promise<boolean>;
  createPlant(connection: PoolConnection, input: CreateUiPlantInput): Promise<number>;
  updatePlant(connection: PoolConnection, input: UpdateUiPlantInput): Promise<void>;
  deletePlant(connection: PoolConnection, id: number): Promise<boolean>;
  listDashboardPlants(): Promise<DashboardPlantRecord[]>;
  getDashboardTank(): Promise<DashboardTankRecord | null>;
  waterPlant(connection: PoolConnection, plantId: number, duration: number): Promise<boolean>;
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

    async listPoints() {
      const [rows] = await pool.query<UiPointRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.device_id AS deviceId,
            p.plant_id AS plantId,
            p.capacity_id AS capacityId,
            p.last_watering AS lastWatering,
            p.notes,
            p.watering_type AS wateringType,
            p.watering_value AS wateringValue,
            p.watering_hour AS wateringHour,
            p.num AS \`index\`,
            p.address,
            p.status,
            p.humidity
          FROM points p
          ORDER BY p.device_id ASC, p.num ASC, p.id ASC
        `,
      );

      return rows.map(mapUiPointRow);
    },

    async findPointById(id) {
      const [rows] = await pool.query<UiPointRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.device_id AS deviceId,
            p.plant_id AS plantId,
            p.capacity_id AS capacityId,
            p.last_watering AS lastWatering,
            p.notes,
            p.watering_type AS wateringType,
            p.watering_value AS wateringValue,
            p.watering_hour AS wateringHour,
            p.num AS \`index\`,
            p.address,
            p.status,
            p.humidity
          FROM points p
          WHERE p.id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] ? mapUiPointRow(rows[0]) : null;
    },

    async listCapacitors() {
      const [rows] = await pool.query<UiCapacitorRow[]>(
        `
          SELECT
            c.id,
            c.user_id AS userId,
            c.capacity,
            c.value
          FROM capacitors c
          ORDER BY c.id ASC
        `,
      );

      return rows.map(mapUiCapacitorRow);
    },

    async findCapacitorById(id) {
      const [rows] = await pool.query<UiCapacitorRow[]>(
        `
          SELECT
            c.id,
            c.user_id AS userId,
            c.capacity,
            c.value
          FROM capacitors c
          WHERE c.id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] ? mapUiCapacitorRow(rows[0]) : null;
    },

    async listPlaces() {
      const [rows] = await pool.query<UiPlaceRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.num AS \`index\`,
            p.name
          FROM places p
          ORDER BY p.num ASC, p.id ASC
        `,
      );

      return rows.map(mapUiPlaceRow);
    },

    async findPlaceById(id) {
      const [rows] = await pool.query<UiPlaceRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.num AS \`index\`,
            p.name
          FROM places p
          WHERE p.id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] ? mapUiPlaceRow(rows[0]) : null;
    },

    async listPlants() {
      const [rows] = await pool.query<UiPlantRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.name,
            p.species,
            p.location,
            p.target_humidity_min AS targetHumidityMin,
            p.target_humidity_max AS targetHumidityMax,
            p.target_watering_duration_sec AS targetWateringDurationSec,
            p.active
          FROM plants p
          ORDER BY p.id ASC
        `,
      );

      return rows.map(mapUiPlantRow);
    },

    async findPlantById(id) {
      const [rows] = await pool.query<UiPlantRow[]>(
        `
          SELECT
            p.id,
            p.user_id AS userId,
            p.name,
            p.species,
            p.location,
            p.target_humidity_min AS targetHumidityMin,
            p.target_humidity_max AS targetHumidityMax,
            p.target_watering_duration_sec AS targetWateringDurationSec,
            p.active
          FROM plants p
          WHERE p.id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] ? mapUiPlantRow(rows[0]) : null;
    },

    async createDevice(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO devices (user_id, place_id, notes, device_key, sleep_duration, activity_number, check_interval) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          input.userId ?? 1,
          input.placeId,
          normalizeNotes(input.notes),
          input.deviceKey,
          input.sleepDuration,
          input.activityNumber,
          input.checkInterval,
        ],
      );

      return result.insertId;
    },

    async updateDevice(connection, input) {
      await connection.execute<ResultSetHeader>(
        "UPDATE devices SET place_id = ?, notes = ?, device_key = ?, sleep_duration = ?, activity_number = ?, check_interval = ? WHERE id = ?",
        [
          input.placeId,
          normalizeNotes(input.notes),
          input.deviceKey,
          input.sleepDuration,
          input.activityNumber,
          input.checkInterval,
          input.id,
        ],
      );
    },

    async deleteDevice(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM devices WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },

    async createCapacitor(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO capacitors (user_id, capacity, value) VALUES (?, ?, ?)",
        [input.userId ?? 1, input.capacity, input.value],
      );

      return result.insertId;
    },

    async updateCapacitor(connection, input) {
      await connection.execute<ResultSetHeader>(
        "UPDATE capacitors SET user_id = ?, capacity = ?, value = ? WHERE id = ?",
        [input.userId ?? 1, input.capacity, input.value, input.id],
      );
    },

    async deleteCapacitor(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM capacitors WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },

    async createPoint(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO points (
          user_id, device_id, plant_id, capacity_id, last_watering, notes,
          watering_type, watering_value, watering_hour, num, address, status, humidity
        ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.userId ?? 1,
          input.deviceId,
          input.plantId ?? null,
          input.capacityId ?? null,
          normalizeNotes(input.notes),
          input.wateringType,
          input.wateringValue,
          input.wateringHour,
          input.index,
          normalizeNullable(input.address),
          normalizeNullable(input.status),
          input.humidity ?? null,
        ],
      );

      return result.insertId;
    },

    async updatePoint(connection, input) {
      await connection.execute<ResultSetHeader>(
        `UPDATE points SET
          user_id = ?, device_id = ?, plant_id = ?, capacity_id = ?, notes = ?,
          watering_type = ?, watering_value = ?, watering_hour = ?, num = ?,
          address = ?, status = ?, humidity = ?
        WHERE id = ?`,
        [
          input.userId ?? 1,
          input.deviceId,
          input.plantId ?? null,
          input.capacityId ?? null,
          normalizeNotes(input.notes),
          input.wateringType,
          input.wateringValue,
          input.wateringHour,
          input.index,
          normalizeNullable(input.address),
          normalizeNullable(input.status),
          input.humidity ?? null,
          input.id,
        ],
      );
    },

    async deletePoint(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM points WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },

    async createPlace(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO places (user_id, num, name) VALUES (?, ?, ?)",
        [input.userId ?? 1, input.index, normalizeName(input.name)],
      );

      return result.insertId;
    },

    async updatePlace(connection, input) {
      await connection.execute<ResultSetHeader>(
        "UPDATE places SET user_id = ?, num = ?, name = ? WHERE id = ?",
        [input.userId ?? 1, input.index, normalizeName(input.name), input.id],
      );
    },

    async deletePlace(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM places WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },

    async createPlant(connection, input) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO plants (
          external_id,
          user_id,
          name,
          species,
          location,
          target_humidity_min,
          target_humidity_max,
          target_watering_duration_sec,
          active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatePlantExternalId(),
          input.userId ?? 1,
          normalizeName(input.name),
          normalizeNullable(input.species),
          normalizeNullable(input.location),
          input.targetHumidityMin ?? null,
          input.targetHumidityMax ?? null,
          input.targetWateringDurationSec ?? null,
          input.active ?? true ? 1 : 0,
        ],
      );

      return result.insertId;
    },

    async updatePlant(connection, input) {
      await connection.execute<ResultSetHeader>(
        `UPDATE plants SET
          user_id = ?,
          name = ?,
          species = ?,
          location = ?,
          target_humidity_min = ?,
          target_humidity_max = ?,
          target_watering_duration_sec = ?,
          active = ?
        WHERE id = ?`,
        [
          input.userId ?? 1,
          normalizeName(input.name),
          normalizeNullable(input.species),
          normalizeNullable(input.location),
          input.targetHumidityMin ?? null,
          input.targetHumidityMax ?? null,
          input.targetWateringDurationSec ?? null,
          input.active ?? true ? 1 : 0,
          input.id,
        ],
      );
    },

    async deletePlant(connection, id) {
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM plants WHERE id = ?",
        [id],
      );

      return result.affectedRows > 0;
    },

    async listDashboardPlants() {
      const [rows] = await pool.query<DashboardPlantRow[]>(
        `
          SELECT
            p.id,
            p.name,
            p.species AS type,
            p.location,
            pt.humidity AS soilHumidity,
            pt.last_watering AS lastWatered,
            COALESCE(p.target_watering_duration_sec, pt.watering_value) AS wateringDuration,
            p.target_humidity_min AS targetHumidityMin,
            p.target_humidity_max AS targetHumidityMax
          FROM points pt
          JOIN plants p ON p.id = pt.plant_id
          ORDER BY pt.device_id ASC, pt.num ASC, pt.id ASC
        `,
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name ?? "",
        type: row.type,
        location: row.location,
        soilHumidity: row.soilHumidity,
        lastWatered: row.lastWatered,
        wateringDuration: row.wateringDuration,
        targetHumidityMin: row.targetHumidityMin,
        targetHumidityMax: row.targetHumidityMax,
      }));
    },

    async getDashboardTank() {
      const [rows] = await pool.query<DashboardTankRow[]>(
        `
          SELECT
            t.id,
            t.capacity_ml AS capacityMl,
            t.current_level_ml AS currentLevelMl,
            t.last_refilled_at AS lastRefilledAt
          FROM tanks t
          ORDER BY t.id ASC
          LIMIT 1
        `,
      );

      if (!rows[0]) {
        return null;
      }

      return {
        id: rows[0].id,
        capacityMl: rows[0].capacityMl,
        currentLevelMl: rows[0].currentLevelMl,
        lastRefilledAt: rows[0].lastRefilledAt,
      };
    },

    async waterPlant(connection, plantId, duration) {
      const [pointUpdate] = await connection.execute<ResultSetHeader>(
        `
          UPDATE points
          SET
            last_watering = NOW(),
            watering_value = CASE
              WHEN ? > 0 THEN ?
              ELSE watering_value
            END
          WHERE plant_id = ?
        `,
        [duration, duration, plantId],
      );

      await connection.execute<ResultSetHeader>(
        `
          UPDATE points
          SET humidity = LEAST(COALESCE(humidity, 0) + 20, 100)
          WHERE plant_id = ?
        `,
        [plantId],
      );

      return pointUpdate.affectedRows > 0;
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

function mapUiPointRow(row: UiPointRow): UiPointRecord {
  return {
    id: row.id,
    userId: row.userId,
    deviceId: row.deviceId,
    plantId: row.plantId,
    capacityId: row.capacityId,
    lastWatering: row.lastWatering,
    notes: row.notes,
    wateringType: row.wateringType,
    wateringValue: row.wateringValue,
    wateringHour: row.wateringHour,
    index: row.index,
    address: row.address,
    status: row.status,
    humidity: row.humidity,
  };
}

function mapUiCapacitorRow(row: UiCapacitorRow): UiCapacitorRecord {
  return {
    id: row.id,
    userId: row.userId,
    capacity: row.capacity,
    value: row.value,
  };
}

function mapUiPlaceRow(row: UiPlaceRow): UiPlaceRecord {
  return {
    id: row.id,
    userId: row.userId,
    index: row.index,
    name: row.name,
  };
}

function mapUiPlantRow(row: UiPlantRow): UiPlantRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    species: row.species,
    location: row.location,
    targetHumidityMin: row.targetHumidityMin,
    targetHumidityMax: row.targetHumidityMax,
    targetWateringDurationSec: row.targetWateringDurationSec,
    active: Boolean(row.active),
  };
}

function normalizeNotes(notes?: string): string {
  return notes?.trim() ?? "";
}

function normalizeName(name: string): string {
  return name.trim();
}

function normalizeNullable(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function generatePlantExternalId(): string {
  return `pl_${randomUUID().replaceAll("-", "")}`;
}
