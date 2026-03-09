import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { DatabaseContext } from "../../db/index.js";
import {
  createRuntimeRepositories,
  type RuntimeRepositories,
} from "./runtime-repositories.js";
import type {
  CanonicalEventRecord,
  RuntimeDeviceRecord,
  RuntimePointRecord,
  RuntimeScheduleRecord,
} from "./runtime-types.js";

export interface RuntimeWateringQuery {
  device: string;
  ttt?: string;
}

export interface RuntimeWateringResponse {
  [address: string]: number;
}

interface RuntimeStatuses {
  [address: string]: string;
}

interface RuntimeContext {
  device: RuntimeDeviceRecord;
  points: RuntimePointRecord[];
  schedules: RuntimeScheduleRecord[];
  recentEvents: CanonicalEventRecord[];
}

export class RuntimeService {
  private readonly repositories: RuntimeRepositories;

  public constructor(private readonly database: DatabaseContext) {
    this.repositories = createRuntimeRepositories(database.pool);
  }

  public async handleWateringPoll(
    query: RuntimeWateringQuery,
  ): Promise<RuntimeWateringResponse> {
    const statuses = this.parseStatuses(query.ttt);
    const context = await this.loadRuntimeContext(query.device);

    return this.database.withTransaction(async (connection) => {
      await this.recordDeviceCheckIn(connection, context.device.id);

      const currentHour = this.getCurrentHourForTimezone(context.device.timezone);
      const response: RuntimeWateringResponse = {};

      for (const point of context.points) {
        if (!point.address) {
          continue;
        }

        const incomingStatus = statuses[point.address];
        if (incomingStatus !== undefined && incomingStatus !== point.status) {
          await connection.execute<ResultSetHeader>(
            "UPDATE points SET status = ? WHERE id = ?",
            [incomingStatus, point.id],
          );
        }

        const activeWateringSchedule = context.schedules.find(
          (schedule) =>
            schedule.enabled === 1 &&
            schedule.eventType === "watering" &&
            schedule.pointId === point.id,
        );

        const wateringHour = activeWateringSchedule?.hour ?? point.wateringHour;
        const wateringDuration =
          activeWateringSchedule?.duration ?? point.wateringValue;
        const shouldWater = this.shouldWaterPoint(
          point,
          wateringHour,
          currentHour,
        );

        if (!shouldWater) {
          response[point.address] = 0;
          continue;
        }

        response[point.address] = wateringDuration;

        await connection.execute<ResultSetHeader>(
          "UPDATE points SET last_watering = NOW() WHERE id = ?",
          [point.id],
        );

        await connection.execute<ResultSetHeader>(
          "UPDATE capacitors SET value = value - ? WHERE id = ?",
          [wateringDuration, point.capacityId],
        );

        await connection.execute<ResultSetHeader>(
          "INSERT INTO events SET point_id = ?, time = NOW(), amount = ?, event_type = 'watering'",
          [point.id, wateringDuration],
        );

        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO events_canonical (
              external_id,
              legacy_event_id,
              event_type,
              occurred_at,
              device_id,
              point_id,
              plant_id,
              amount_ml,
              duration_sec,
              humidity,
              status,
              payload
            ) VALUES (
              ?, NULL, 'watering', NOW(), ?, ?, ?, ?, ?, ?, 'success', JSON_OBJECT('source', 'backend-ts-runtime')
            )
          `,
          [
            this.buildCanonicalEventExternalId(context.device.id, point.id),
            context.device.id,
            point.id,
            point.plantId,
            wateringDuration,
            wateringDuration,
            point.humidity,
          ],
        );
      }

      return response;
    });
  }

  private async loadRuntimeContext(deviceKey: string): Promise<RuntimeContext> {
    const device = await this.repositories.findDeviceByKey(deviceKey);

    if (!device) {
      throw new Error("Device not found");
    }

    const [points, schedules, recentEvents] = await Promise.all([
      this.repositories.listPointsByDeviceId(device.id),
      this.repositories.listSchedulesByDeviceId(device.id),
      this.repositories.listRecentCanonicalEventsByDeviceId(device.id),
    ]);

    return { device, points, schedules, recentEvents };
  }

  private parseStatuses(rawStatuses?: string): RuntimeStatuses {
    if (!rawStatuses) {
      return {};
    }

    const parsed = JSON.parse(rawStatuses) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid ttt payload");
    }

    return parsed as RuntimeStatuses;
  }

  private shouldWaterPoint(
    point: RuntimePointRecord,
    wateringHour: number,
    currentHour: number,
  ): boolean {
    const lastWateringTime = point.lastWatering
      ? Math.floor(new Date(point.lastWatering).getTime() / 1000)
      : 0;
    const now = Math.floor(Date.now() / 1000);

    if (now - lastWateringTime < 20 * 60 * 60) {
      return false;
    }

    return currentHour >= wateringHour;
  }

  private getCurrentHourForTimezone(timezone: string): number {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    });
    return Number.parseInt(formatter.format(new Date()), 10);
  }

  private async recordDeviceCheckIn(
    connection: PoolConnection,
    deviceId: number,
  ): Promise<void> {
    await connection.execute<ResultSetHeader>(
      "UPDATE devices SET last_access = NOW() WHERE id = ?",
      [deviceId],
    );

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO events_canonical (
          external_id,
          legacy_event_id,
          event_type,
          occurred_at,
          device_id,
          point_id,
          plant_id,
          amount_ml,
          duration_sec,
          humidity,
          status,
          payload
        ) VALUES (
          ?, NULL, 'device_checkin', NOW(), ?, NULL, NULL, NULL, NULL, NULL, 'info', JSON_OBJECT('source', 'backend-ts-runtime')
        )
      `,
      [this.buildDeviceCheckInExternalId(deviceId), deviceId],
    );
  }

  private buildCanonicalEventExternalId(deviceId: number, pointId: number): string {
    return `ev_rt_${deviceId}_${pointId}_${Date.now()}`;
  }

  private buildDeviceCheckInExternalId(deviceId: number): string {
    return `ev_checkin_${deviceId}_${Date.now()}`;
  }
}
