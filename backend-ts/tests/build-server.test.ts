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
    corsOrigins: ["http://localhost:3000", "http://localhost:4200"],
    dbHost: "db",
    dbPort: 3306,
    dbName: "dropstation",
    dbUser: "root",
    dbPassword: "gotechnies",
    authTokenSecret: "test-secret",
    authTokenTtlSeconds: 3600,
  };
}

const DEFAULT_TEST_PASSWORD_HASH =
  "scrypt$16384$8$1$i0hly_X09ycrznpvVOlxYA$OM3Xnl0TvYK1M7CNqKtMaDKGGsuBcEx-ZDchDr9CdighBIP1W0QlcDrNEDnZwPR5yXSZBOneO2nYPAXwRP05Xw";

async function loginAndGetHeaders(
  app: ReturnType<typeof buildServer>,
  username = "admin",
): Promise<Record<string, string>> {
  const loginResponse = await app.inject({
    method: "POST",
    url: "/api/ui/v1/auth/login",
    payload: {
      username,
      password: "admin",
    },
  });

  expect(loginResponse.statusCode).toBe(200);
  const payload = loginResponse.json() as { token: string };
  return {
    authorization: `Bearer ${payload.token}`,
  };
}

function makeDatabaseContext(overrides?: {
  query?: (sql: string, params?: unknown[]) => Promise<[unknown[], unknown]>;
  execute?: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]>;
  authUser?: {
    id: number;
    login: string;
    email: string;
    passwordHash: string;
    active: number;
  } | null;
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
      query: async (sql: string, params?: unknown[]) => {
        if (sql.includes("FROM users u")) {
          const authUser = Object.prototype.hasOwnProperty.call(overrides ?? {}, "authUser")
            ? overrides?.authUser
            : {
            id: 1001,
            login: "admin",
            email: "admin@example.com",
            passwordHash: DEFAULT_TEST_PASSWORD_HASH,
            active: 1,
            };
          if (!authUser) {
            return [[], {}];
          }

          const identifier = String(params?.[0] ?? "");
          if (identifier === authUser.login || identifier === authUser.email) {
            return [[authUser], {}];
          }

          return [[], {}];
        }

        return query(sql, params);
      },
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

  it("handles CORS preflight for additional configured origin", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/ui/v1/dashboard/plants",
      headers: {
        origin: "http://localhost:4200",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:4200");
  });

  it("does not allow CORS for unconfigured origin", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/ui/v1/dashboard/plants",
      headers: {
        origin: "http://malicious.local",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/devices",
      headers: authHeaders,
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/ui/v1/devices",
      headers: authHeaders,
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/devices/9",
      headers: authHeaders,
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "PUT",
      url: "/api/ui/v1/devices/12",
      headers: authHeaders,
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "DELETE",
      url: "/api/ui/v1/devices/15",
      headers: authHeaders,
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
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/points",
      headers: authHeaders,
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

  it("serves dashboard plants", async () => {
    const plantRows = [
      {
        id: 4,
        name: "Monstera",
        type: "Tropical",
        location: "Living Room",
        soilHumidity: 52,
        lastWatered: "2026-03-08 10:00:00",
        wateringDuration: 45,
        targetHumidityMin: 45,
        targetHumidityMax: 65,
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM points pt") && sql.includes("JOIN plants p")) {
            return [plantRows, {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/dashboard/plants",
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      {
        id: 4,
        name: "Monstera",
        type: "Tropical",
        location: "Living Room",
        soilHumidity: 52,
        lastWatered: "2026-03-08T10:00:00.000Z",
        wateringDuration: 45,
        status: "optimal",
        image: "https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=400&plant=4",
        optimalHumidity: {
          min: 45,
          max: 65,
        },
      },
    ]);
  });

  it("serves dashboard tank", async () => {
    const tankRows = [
      {
        id: 1,
        capacityMl: 50000,
        currentLevelMl: 32500,
        lastRefilledAt: "2026-03-07 12:00:00",
      },
    ];

    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        query: async (sql) => {
          if (sql.includes("FROM tanks t")) {
            return [tankRows, {}];
          }

          return [[], {}];
        },
      }),
    );
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/dashboard/water-tank",
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 1,
      capacity: 50,
      currentLevel: 33,
      lastRefilled: "2026-03-07T12:00:00.000Z",
      status: "medium",
    });
  });

  it("waters dashboard plant", async () => {
    const app = buildServer(
      makeConfig(),
      makeDatabaseContext({
        execute: async (sql) => {
          if (sql.includes("UPDATE points") && sql.includes("WHERE plant_id = ?")) {
            return [{ affectedRows: 1 }, {}];
          }

          return [{}, {}];
        },
      }),
    );
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/ui/v1/dashboard/plants/7/water",
      headers: authHeaders,
      payload: {
        duration: 30,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
    });
  });

  it("rejects unauthenticated access to protected UI routes", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/ui/v1/devices",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
    });
  });

  it("returns token for valid login by login/email and rejects invalid credentials", async () => {
    const app = buildServer(makeConfig(), makeDatabaseContext());
    apps.push(app);

    const successResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/auth/login",
      payload: {
        username: "admin",
        password: "admin",
      },
    });

    expect(successResponse.statusCode).toBe(200);
    expect(successResponse.json()).toMatchObject({
      tokenType: "Bearer",
      expiresIn: 3600,
    });

    const emailResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/auth/login",
      payload: {
        username: "admin@example.com",
        password: "admin",
      },
    });
    expect(emailResponse.statusCode).toBe(200);

    const failedResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/auth/login",
      payload: {
        username: "admin",
        password: "wrong",
      },
    });

    expect(failedResponse.statusCode).toBe(403);
    expect(failedResponse.json()).toEqual({
      error: "Forbidden",
    });
  });

  it("rejects missing or inactive DB users during login", async () => {
    const missingUserApp = buildServer(
      makeConfig(),
      makeDatabaseContext({
        authUser: null,
      }),
    );
    apps.push(missingUserApp);

    const missingUserResponse = await missingUserApp.inject({
      method: "POST",
      url: "/api/ui/v1/auth/login",
      payload: {
        username: "admin",
        password: "admin",
      },
    });
    expect(missingUserResponse.statusCode).toBe(403);

    const inactiveUserApp = buildServer(
      makeConfig(),
      makeDatabaseContext({
        authUser: {
          id: 1001,
          login: "admin",
          email: "admin@example.com",
          passwordHash: DEFAULT_TEST_PASSWORD_HASH,
          active: 0,
        },
      }),
    );
    apps.push(inactiveUserApp);

    const inactiveUserResponse = await inactiveUserApp.inject({
      method: "POST",
      url: "/api/ui/v1/auth/login",
      payload: {
        username: "admin",
        password: "admin",
      },
    });
    expect(inactiveUserResponse.statusCode).toBe(403);
  });
});
