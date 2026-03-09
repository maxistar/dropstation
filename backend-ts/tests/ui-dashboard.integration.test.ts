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

async function loginAndGetHeaders(app: ReturnType<typeof buildServer>): Promise<Record<string, string>> {
  const loginResponse = await app.inject({
    method: "POST",
    url: "/api/ui/v1/auth/login",
    payload: {
      username: "admin",
      password: "admin",
    },
  });

  expect(loginResponse.statusCode).toBe(200);
  const payload = loginResponse.json() as { token: string };
  return {
    authorization: `Bearer ${payload.token}`,
  };
}

interface FakeState {
  plants: Array<{
    id: number;
    name: string;
    type: string | null;
    location: string | null;
    soilHumidity: number;
    lastWatered: string;
    wateringDuration: number;
    targetHumidityMin: number;
    targetHumidityMax: number;
  }>;
  tank: {
    id: number;
    capacityMl: number;
    currentLevelMl: number;
    lastRefilledAt: string;
  } | null;
}

function makeDatabaseContext(state: FakeState): DatabaseContext {
  return {
    pool: {
      query: async (sql: string, params?: unknown[]) => {
        if (sql.includes("FROM users u")) {
          const identifier = String(params?.[0] ?? "");
          if (identifier === "admin" || identifier === "admin@example.com") {
            return [[{
              id: 1001,
              login: "admin",
              email: "admin@example.com",
              passwordHash: DEFAULT_TEST_PASSWORD_HASH,
              active: 1,
            }], {}] as [unknown[], unknown];
          }

          return [[], {}] as [unknown[], unknown];
        }

        if (sql.includes("FROM points pt") && sql.includes("JOIN plants p")) {
          return [state.plants, {}] as [unknown[], unknown];
        }

        if (sql.includes("FROM tanks t")) {
          return [state.tank ? [state.tank] : [], {}] as [unknown[], unknown];
        }

        return [[], {}] as [unknown[], unknown];
      },
      getConnection: async () => ({
        beginTransaction: async () => undefined,
        commit: async () => undefined,
        rollback: async () => undefined,
        release: () => undefined,
        execute: async (sql: string, params?: unknown[]) => {
          if (
            sql.includes("UPDATE points")
            && sql.includes("watering_value")
            && sql.includes("WHERE plant_id = ?")
          ) {
            const plantId = Number(params?.[2] ?? params?.[0]);
            const duration = Number(params?.[0] ?? 30);
            const plant = state.plants.find((item) => item.id === plantId);

            if (!plant) {
              return [{ affectedRows: 0 }, {}] as [unknown, unknown];
            }

            plant.lastWatered = "2026-03-08 12:00:00";
            plant.wateringDuration = duration;
            return [{ affectedRows: 1 }, {}] as [unknown, unknown];
          }

          if (
            sql.includes("UPDATE points")
            && sql.includes("SET humidity = LEAST")
            && sql.includes("WHERE plant_id = ?")
          ) {
            const plantId = Number(params?.[0]);
            const plant = state.plants.find((item) => item.id === plantId);
            if (plant) {
              plant.soilHumidity = Math.min(plant.soilHumidity + 20, 100);
            }
            return [{ affectedRows: plant ? 1 : 0 }, {}] as [unknown, unknown];
          }

          return [{}, {}] as [unknown, unknown];
        },
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

describe("UI dashboard integration", () => {
  const apps: ReturnType<typeof buildServer>[] = [];

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  it("serves dashboard plants and tank from UI endpoints", async () => {
    const state: FakeState = {
      plants: [
        {
          id: 1,
          name: "Monstera",
          type: "Tropical",
          location: "Living Room",
          soilHumidity: 50,
          lastWatered: "2026-03-08 10:00:00",
          wateringDuration: 30,
          targetHumidityMin: 45,
          targetHumidityMax: 65,
        },
      ],
      tank: {
        id: 1,
        capacityMl: 50000,
        currentLevelMl: 25000,
        lastRefilledAt: "2026-03-07 09:00:00",
      },
    };
    const app = buildServer(makeConfig(), makeDatabaseContext(state));
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const [plantsResponse, tankResponse] = await Promise.all([
      app.inject({ method: "GET", url: "/api/ui/v1/dashboard/plants", headers: authHeaders }),
      app.inject({ method: "GET", url: "/api/ui/v1/dashboard/water-tank", headers: authHeaders }),
    ]);

    expect(plantsResponse.statusCode).toBe(200);
    expect(plantsResponse.json()).toMatchObject([
      {
        id: 1,
        name: "Monstera",
        status: "optimal",
      },
    ]);

    expect(tankResponse.statusCode).toBe(200);
    expect(tankResponse.json()).toMatchObject({
      id: 1,
      capacity: 50,
      currentLevel: 25,
      status: "medium",
    });
  });

  it("updates plant data through dashboard watering endpoint", async () => {
    const state: FakeState = {
      plants: [
        {
          id: 3,
          name: "Peace Lily",
          type: "Flowering",
          location: "Bedroom",
          soilHumidity: 30,
          lastWatered: "2026-03-06 08:00:00",
          wateringDuration: 20,
          targetHumidityMin: 45,
          targetHumidityMax: 65,
        },
      ],
      tank: {
        id: 1,
        capacityMl: 50000,
        currentLevelMl: 25000,
        lastRefilledAt: "2026-03-07 09:00:00",
      },
    };
    const app = buildServer(makeConfig(), makeDatabaseContext(state));
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const waterResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/dashboard/plants/3/water",
      headers: authHeaders,
      payload: { duration: 40 },
    });

    expect(waterResponse.statusCode).toBe(200);
    expect(waterResponse.json()).toEqual({ success: true });

    const plantsResponse = await app.inject({
      method: "GET",
      url: "/api/ui/v1/dashboard/plants",
      headers: authHeaders,
    });
    const plants = plantsResponse.json() as Array<{ id: number; soilHumidity: number; wateringDuration: number; status: string }>;
    expect(plants[0]).toMatchObject({
      id: 3,
      soilHumidity: 50,
      wateringDuration: 40,
      status: "optimal",
    });
  });

  it("rejects invalid watering requests and missing plants", async () => {
    const state: FakeState = {
      plants: [],
      tank: null,
    };
    const app = buildServer(makeConfig(), makeDatabaseContext(state));
    apps.push(app);
    const authHeaders = await loginAndGetHeaders(app);

    const invalidIdResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/dashboard/plants/not-a-number/water",
      headers: authHeaders,
      payload: { duration: 30 },
    });
    expect(invalidIdResponse.statusCode).toBe(400);

    const invalidDurationResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/dashboard/plants/10/water",
      headers: authHeaders,
      payload: { duration: 0 },
    });
    expect(invalidDurationResponse.statusCode).toBe(400);

    const missingPlantResponse = await app.inject({
      method: "POST",
      url: "/api/ui/v1/dashboard/plants/10/water",
      headers: authHeaders,
      payload: { duration: 20 },
    });
    expect(missingPlantResponse.statusCode).toBe(404);
  });

  it("allows additional configured CORS origin for dashboard routes", async () => {
    const state: FakeState = {
      plants: [],
      tank: null,
    };
    const app = buildServer(makeConfig(), makeDatabaseContext(state));
    apps.push(app);

    const allowedResponse = await app.inject({
      method: "OPTIONS",
      url: "/api/ui/v1/dashboard/plants",
      headers: {
        origin: "http://localhost:4200",
        "access-control-request-method": "GET",
      },
    });
    expect(allowedResponse.statusCode).toBe(204);
    expect(allowedResponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:4200",
    );

    const blockedResponse = await app.inject({
      method: "OPTIONS",
      url: "/api/ui/v1/dashboard/plants",
      headers: {
        origin: "http://evil.local",
        "access-control-request-method": "GET",
      },
    });
    expect(blockedResponse.statusCode).toBe(204);
    expect(blockedResponse.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
