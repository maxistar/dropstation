import { afterAll, describe, expect, it } from "vitest";
import type { DatabaseContext } from "../src/db/index.js";
import { buildServer } from "../src/app/build-server.js";
import type { AppConfig } from "../src/config/load-config.js";

function makeConfig(): AppConfig {
  return {
    host: "127.0.0.1",
    port: 3001,
    nodeEnv: "test",
    logLevel: "silent",
    dbHost: "db",
    dbPort: 3306,
    dbName: "dropstation",
    dbUser: "root",
    dbPassword: "gotechnies",
  };
}

function makeDatabaseContext(overrides?: {
  query?: (sql: string) => Promise<[unknown[], unknown]>;
  execute?: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]>;
}): DatabaseContext {
  const query =
    overrides?.query ??
    (async () => {
      return [[], {}];
    });
  const execute =
    overrides?.execute ??
    (async () => {
      return [{}, {}];
    });

  return {
    pool: {
      query,
      getConnection: async () => ({
        beginTransaction: async () => undefined,
        commit: async () => undefined,
        rollback: async () => undefined,
        release: () => undefined,
        execute,
      }),
    } as unknown as DatabaseContext["pool"],
    async withTransaction(callback) {
      const connection = await this.pool.getConnection();

      try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
  };
}

describe("buildServer", () => {
  const apps: ReturnType<typeof buildServer>[] = [];

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  it("serves the health endpoint", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "dropstation-backend-ts",
      status: "ok",
    });
  });

  it("returns 404 for an unknown runtime device", async () => {
    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM devices d")) {
            return [[], {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/device/v1/watering?device=missing-device",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: "Device not found",
    });
  });

  it("returns watering instructions for a runtime device", async () => {
    const deviceRow = [
      {
        id: 1,
        userId: 1,
        placeId: 1,
        deviceKey: "device-key",
        lastAccess: null,
        notes: "controller",
        battery: 4.1,
        sleepDuration: 3600,
        activityNumber: 1,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 900,
        timezone: "UTC",
      },
    ];
    const pointRows = [
      {
        id: 10,
        userId: 1,
        deviceId: 1,
        plantId: 20,
        capacityId: 2,
        lastWatering: new Date(Date.now() - 21 * 60 * 60 * 1000),
        notes: "plant",
        wateringType: 0,
        wateringValue: 70,
        wateringHour: 0,
        index: 1,
        address: "04ABC20A",
        status: "ok",
        humidity: 55,
      },
    ];
    const scheduleRows = [
      {
        id: 30,
        externalId: "sc_legacy_0000000030",
        hour: 0,
        minute: 0,
        eventType: "watering",
        deviceId: 1,
        pointId: 10,
        plantId: 20,
        duration: 40,
        recurrence: "daily",
        activeFrom: null,
        activeUntil: null,
        enabled: 1,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM devices d")) {
            return [deviceRow, {}];
          }
          if (sql.includes("FROM points")) {
            return [pointRows, {}];
          }
          if (sql.includes("FROM schedule")) {
            return [scheduleRows, {}];
          }
          if (sql.includes("FROM events_canonical")) {
            return [[], {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/device/v1/watering?device=device-key&ttt=%7B%2204ABC20A%22%3A%22ok%22%7D",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      "04ABC20A": 40,
    });
  });
});
