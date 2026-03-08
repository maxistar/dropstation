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
    corsOrigin: "http://localhost:3000",
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

  it("handles CORS preflight for UI endpoints", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/ui/v1/devices",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
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

  it("serves the UI device list", async () => {
    const deviceRows = [
      {
        id: 7,
        userId: 1,
        placeId: 1,
        deviceKey: "dev-7",
        lastAccess: null,
        notes: "Greenhouse controller",
        battery: 4.0,
        sleepDuration: 3600,
        activityNumber: 2,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 900,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM devices d") && sql.includes("ORDER BY d.id ASC")) {
            return [deviceRows, {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/devices",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      {
        id: 7,
        name: "Greenhouse controller",
        notes: "Greenhouse controller",
        deviceKey: "dev-7",
        lastAccess: null,
        battery: 4,
        sleepDuration: 3600,
        activityNumber: 2,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 900,
      },
    ]);
  });

  it("creates a UI device", async () => {
    const createdDeviceRows = [
      {
        id: 42,
        userId: 1,
        placeId: null,
        deviceKey: "new-device",
        lastAccess: null,
        notes: "",
        battery: null,
        sleepDuration: 0,
        activityNumber: 0,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 0,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql, params) => {
          if (sql.includes("FROM devices d") && params?.[0] === 42) {
            return [createdDeviceRows, {}];
          }

          return [[], {}];
        },
        execute: async (sql) => {
          if (sql.includes("INSERT INTO devices")) {
            return [{ insertId: 42 }, {}];
          }

          return [{}, {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/ui/v1/devices",
      payload: {
        name: "Ignored UI Name",
        notes: "",
        deviceKey: "new-device",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: 42,
      name: "Device 42",
      notes: "",
      deviceKey: "new-device",
      lastAccess: null,
      battery: null,
      sleepDuration: 0,
      activityNumber: 0,
      recentEventTime: null,
      recentEventId: null,
      checkInterval: 0,
    });
  });

  it("serves a UI device detail", async () => {
    const deviceRows = [
      {
        id: 9,
        userId: 1,
        placeId: 1,
        deviceKey: "dev-9",
        lastAccess: null,
        notes: "Balcony controller",
        battery: 3.9,
        sleepDuration: 1800,
        activityNumber: 4,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 600,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql, params) => {
          if (sql.includes("FROM devices d") && params?.[0] === 9) {
            return [deviceRows, {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/devices/9",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 9,
      name: "Balcony controller",
      notes: "Balcony controller",
      deviceKey: "dev-9",
      lastAccess: null,
      battery: 3.9,
      sleepDuration: 1800,
      activityNumber: 4,
      recentEventTime: null,
      recentEventId: null,
      checkInterval: 600,
    });
  });

  it("updates a UI device", async () => {
    const existingDeviceRows = [
      {
        id: 12,
        userId: 1,
        placeId: null,
        deviceKey: "old-key",
        lastAccess: null,
        notes: "Old notes",
        battery: null,
        sleepDuration: 0,
        activityNumber: 0,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 0,
      },
    ];
    const updatedDeviceRows = [
      {
        id: 12,
        userId: 1,
        placeId: null,
        deviceKey: "new-key",
        lastAccess: null,
        notes: "Updated notes",
        battery: null,
        sleepDuration: 0,
        activityNumber: 0,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 0,
      },
    ];

    let readCount = 0;

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql, params) => {
          if (sql.includes("FROM devices d") && params?.[0] === 12) {
            readCount += 1;
            return [readCount === 1 ? existingDeviceRows : updatedDeviceRows, {}];
          }

          return [[], {}];
        },
        execute: async (sql) => {
          if (sql.includes("UPDATE devices SET notes = ?, device_key = ? WHERE id = ?")) {
            return [{ affectedRows: 1 }, {}];
          }

          return [{}, {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "PUT",
      url: "/api/ui/v1/devices/12",
      payload: {
        name: "Ignored Name",
        notes: "Updated notes",
        deviceKey: "new-key",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 12,
      name: "Updated notes",
      notes: "Updated notes",
      deviceKey: "new-key",
      lastAccess: null,
      battery: null,
      sleepDuration: 0,
      activityNumber: 0,
      recentEventTime: null,
      recentEventId: null,
      checkInterval: 0,
    });
  });

  it("deletes a UI device", async () => {
    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        execute: async (sql) => {
          if (sql.includes("DELETE FROM devices WHERE id = ?")) {
            return [{ affectedRows: 1 }, {}];
          }

          return [{}, {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "DELETE",
      url: "/api/ui/v1/devices/15",
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("serves the UI points list", async () => {
    const pointRows = [
      {
        id: 10,
        userId: 1,
        deviceId: 7,
        plantId: 20,
        capacityId: 2,
        lastWatering: null,
        notes: "Window pot",
        wateringType: 0,
        wateringValue: 50,
        wateringHour: 8,
        index: 1,
        address: "04ABC20A",
        status: "ok",
        humidity: 55,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM points p")) {
            return [pointRows, {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/points",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      {
        id: 10,
        name: "04ABC20A",
        deviceId: 7,
        plantId: 20,
        capacityId: 2,
        index: 1,
        address: "04ABC20A",
        status: "ok",
        humidity: 55,
        lastWatering: null,
        notes: "Window pot",
        wateringType: 0,
        wateringValue: 50,
        wateringHour: 8,
      },
    ]);
  });
});
