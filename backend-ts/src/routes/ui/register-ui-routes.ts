import type { FastifyInstance } from "fastify";
import { UiService } from "../../modules/ui/ui-service.js";
import type { DatabaseContext } from "../../db/index.js";
import type { AppConfig } from "../../config/load-config.js";
import {
  buildUiAuthPreHandler,
  createAuthToken,
  sendForbidden,
  type AuthLoginRequestBody,
} from "../../auth/password-auth.js";
import { verifyPasswordHash } from "../../auth/password-hash.js";
import { createUiAuthRepository } from "../../modules/auth/ui-auth-repository.js";

interface DeviceParams {
  id: string;
}

interface DashboardPlantParams {
  id: string;
}

interface UpsertDeviceBody {
  id?: number;
  name?: string;
  notes?: string;
  deviceKey?: string;
  sleepDuration?: number;
  activityNumber?: number;
  checkInterval?: number;
}

interface CapacitorParams {
  id: string;
}

interface UpsertCapacitorBody {
  userId?: number;
  capacity?: number;
  value?: number;
}

interface WaterPlantBody {
  duration?: number;
}

interface PlaceParams {
  id: string;
}

interface UpsertPlaceBody {
  userId?: number;
  index?: number;
  name?: string;
}

interface PlantParams {
  id: string;
}

interface UpsertPlantBody {
  userId?: number;
  name?: string;
  species?: string;
  location?: string;
  targetHumidityMin?: number | null;
  targetHumidityMax?: number | null;
  targetWateringDurationSec?: number | null;
  active?: boolean;
}

interface PointParams {
  id: string;
}

interface UpsertPointBody {
  userId?: number;
  deviceId?: number;
  plantId?: number | null;
  capacityId?: number | null;
  index?: number;
  address?: string;
  status?: string;
  humidity?: number | null;
  notes?: string;
  wateringType?: number;
  wateringValue?: number;
  wateringHour?: number;
}

export function registerUiRoutes(
  app: FastifyInstance,
  database: DatabaseContext,
  config: AppConfig,
): void {
  const uiService = new UiService(database);
  const authRepository = createUiAuthRepository(database.pool);
  const requireUiAuth = buildUiAuthPreHandler(config);

  app.get("/api/ui/v1", async () => {
    return {
      service: "dropstation-backend-ts",
      status: "ok",
    };
  });

  app.post<{ Body: AuthLoginRequestBody }>("/api/ui/v1/auth/login", async (request, reply) => {
    const identifier = request.body?.username?.trim();
    const password = request.body?.password;
    if (!identifier || !password) {
      sendForbidden(reply);
      return;
    }

    const user = await authRepository.findByIdentifier(identifier);
    if (!user || !user.active || !user.passwordHash || !verifyPasswordHash(password, user.passwordHash)) {
      sendForbidden(reply);
      return;
    }

    return {
      token: createAuthToken(user.login || user.email || identifier, config),
      expiresIn: config.authTokenTtlSeconds,
      tokenType: "Bearer",
    };
  });

  app.post("/api/ui/v1/auth/logout", async () => {
    return { success: true };
  });

  app.get("/api/ui/v1/devices", { preHandler: requireUiAuth }, async () => {
    return uiService.listDevices();
  });

  app.get("/api/ui/v1/points", { preHandler: requireUiAuth }, async () => {
    return uiService.listPoints();
  });

  app.get<{ Params: PointParams }>(
    "/api/ui/v1/points/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid point id" };
      }

      try {
        return await uiService.getPoint(id);
      } catch (error) {
        if (error instanceof Error && error.message === "Point not found") {
          reply.code(404);
          return { error: "Point not found" };
        }

        throw error;
      }
    },
  );

  app.post<{ Body: UpsertPointBody }>(
    "/api/ui/v1/points",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const body = request.body ?? {};

      if (
        !isValidNumber(body.deviceId)
        || !isValidNumber(body.index)
        || !isValidNumber(body.wateringType)
        || !isValidNumber(body.wateringValue)
        || !isValidNumber(body.wateringHour)
      ) {
        reply.code(400);
        return { error: "deviceId, index, wateringType, wateringValue and wateringHour are required numbers" };
      }

      const point = await uiService.createPoint({
        userId: body.userId,
        deviceId: Math.trunc(body.deviceId),
        plantId: body.plantId ?? null,
        capacityId: body.capacityId ?? null,
        index: Math.trunc(body.index),
        address: body.address,
        status: body.status,
        humidity: body.humidity ?? null,
        notes: body.notes,
        wateringType: Math.trunc(body.wateringType),
        wateringValue: Math.trunc(body.wateringValue),
        wateringHour: Math.trunc(body.wateringHour),
      });

      reply.code(201);
      return point;
    },
  );

  app.put<{ Params: PointParams; Body: UpsertPointBody }>(
    "/api/ui/v1/points/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid point id" };
      }

      const body = request.body ?? {};
      if (
        !isValidNumber(body.deviceId)
        || !isValidNumber(body.index)
        || !isValidNumber(body.wateringType)
        || !isValidNumber(body.wateringValue)
        || !isValidNumber(body.wateringHour)
      ) {
        reply.code(400);
        return { error: "deviceId, index, wateringType, wateringValue and wateringHour are required numbers" };
      }

      try {
        return await uiService.updatePoint({
          id,
          userId: body.userId,
          deviceId: Math.trunc(body.deviceId),
          plantId: body.plantId ?? null,
          capacityId: body.capacityId ?? null,
          index: Math.trunc(body.index),
          address: body.address,
          status: body.status,
          humidity: body.humidity ?? null,
          notes: body.notes,
          wateringType: Math.trunc(body.wateringType),
          wateringValue: Math.trunc(body.wateringValue),
          wateringHour: Math.trunc(body.wateringHour),
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Point not found") {
          reply.code(404);
          return { error: "Point not found" };
        }

        throw error;
      }
    },
  );

  app.delete<{ Params: PointParams }>(
    "/api/ui/v1/points/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid point id" };
      }

      try {
        await uiService.deletePoint(id);
        reply.code(204);
        return null;
      } catch (error) {
        if (error instanceof Error && error.message === "Point not found") {
          reply.code(404);
          return { error: "Point not found" };
        }

        throw error;
      }
    },
  );

  app.get("/api/ui/v1/places", { preHandler: requireUiAuth }, async () => {
    return uiService.listPlaces();
  });

  app.get("/api/ui/v1/plants", { preHandler: requireUiAuth }, async () => {
    return uiService.listPlants();
  });

  app.get<{ Params: PlantParams }>(
    "/api/ui/v1/plants/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid plant id" };
      }

      try {
        return await uiService.getPlant(id);
      } catch (error) {
        if (error instanceof Error && error.message === "Plant not found") {
          reply.code(404);
          return { error: "Plant not found" };
        }

        throw error;
      }
    },
  );

  app.post<{ Body: UpsertPlantBody }>(
    "/api/ui/v1/plants",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const body = request.body ?? {};

      if (!body.name?.trim()) {
        reply.code(400);
        return { error: "name is required" };
      }

      if (
        !isNullableNumber(body.targetHumidityMin)
        || !isNullableNumber(body.targetHumidityMax)
        || !isNullableNumber(body.targetWateringDurationSec)
      ) {
        reply.code(400);
        return { error: "targetHumidityMin, targetHumidityMax and targetWateringDurationSec must be numbers or null" };
      }

      const plant = await uiService.createPlant({
        userId: body.userId,
        name: body.name.trim(),
        species: body.species,
        location: body.location,
        targetHumidityMin: body.targetHumidityMin ?? null,
        targetHumidityMax: body.targetHumidityMax ?? null,
        targetWateringDurationSec: body.targetWateringDurationSec ?? null,
        active: normalizeActiveFlag(body.active),
      });

      reply.code(201);
      return plant;
    },
  );

  app.put<{ Params: PlantParams; Body: UpsertPlantBody }>(
    "/api/ui/v1/plants/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid plant id" };
      }

      const body = request.body ?? {};
      if (!body.name?.trim()) {
        reply.code(400);
        return { error: "name is required" };
      }

      if (
        !isNullableNumber(body.targetHumidityMin)
        || !isNullableNumber(body.targetHumidityMax)
        || !isNullableNumber(body.targetWateringDurationSec)
      ) {
        reply.code(400);
        return { error: "targetHumidityMin, targetHumidityMax and targetWateringDurationSec must be numbers or null" };
      }

      try {
        return await uiService.updatePlant({
          id,
          userId: body.userId,
          name: body.name.trim(),
          species: body.species,
          location: body.location,
          targetHumidityMin: body.targetHumidityMin ?? null,
          targetHumidityMax: body.targetHumidityMax ?? null,
          targetWateringDurationSec: body.targetWateringDurationSec ?? null,
          active: normalizeActiveFlag(body.active),
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Plant not found") {
          reply.code(404);
          return { error: "Plant not found" };
        }

        throw error;
      }
    },
  );

  app.delete<{ Params: PlantParams }>(
    "/api/ui/v1/plants/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid plant id" };
      }

      try {
        await uiService.deletePlant(id);
        reply.code(204);
        return null;
      } catch (error) {
        if (error instanceof Error && error.message === "Plant not found") {
          reply.code(404);
          return { error: "Plant not found" };
        }

        throw error;
      }
    },
  );

  app.get<{ Params: PlaceParams }>(
    "/api/ui/v1/places/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid place id" };
      }

      try {
        return await uiService.getPlace(id);
      } catch (error) {
        if (error instanceof Error && error.message === "Place not found") {
          reply.code(404);
          return { error: "Place not found" };
        }

        throw error;
      }
    },
  );

  app.post<{ Body: UpsertPlaceBody }>(
    "/api/ui/v1/places",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const body = request.body ?? {};

      if (!isValidNumber(body.index) || !body.name?.trim()) {
        reply.code(400);
        return { error: "index and name are required" };
      }

      const place = await uiService.createPlace({
        userId: body.userId,
        index: Math.trunc(body.index),
        name: body.name.trim(),
      });

      reply.code(201);
      return place;
    },
  );

  app.put<{ Params: PlaceParams; Body: UpsertPlaceBody }>(
    "/api/ui/v1/places/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid place id" };
      }

      const body = request.body ?? {};
      if (!isValidNumber(body.index) || !body.name?.trim()) {
        reply.code(400);
        return { error: "index and name are required" };
      }

      try {
        return await uiService.updatePlace({
          id,
          userId: body.userId,
          index: Math.trunc(body.index),
          name: body.name.trim(),
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Place not found") {
          reply.code(404);
          return { error: "Place not found" };
        }

        throw error;
      }
    },
  );

  app.delete<{ Params: PlaceParams }>(
    "/api/ui/v1/places/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid place id" };
      }

      try {
        await uiService.deletePlace(id);
        reply.code(204);
        return null;
      } catch (error) {
        if (error instanceof Error && error.message === "Place not found") {
          reply.code(404);
          return { error: "Place not found" };
        }

        throw error;
      }
    },
  );

  app.get("/api/ui/v1/capacitors", { preHandler: requireUiAuth }, async () => {
    return uiService.listCapacitors();
  });

  app.get<{ Params: CapacitorParams }>(
    "/api/ui/v1/capacitors/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid capacitor id" };
      }

      try {
        return await uiService.getCapacitor(id);
      } catch (error) {
        if (error instanceof Error && error.message === "Capacitor not found") {
          reply.code(404);
          return { error: "Capacitor not found" };
        }

        throw error;
      }
    },
  );

  app.post<{ Body: UpsertCapacitorBody }>(
    "/api/ui/v1/capacitors",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const body = request.body ?? {};

      if (!isValidNumber(body.capacity) || !isValidNumber(body.value)) {
        reply.code(400);
        return { error: "capacity and value are required numbers" };
      }

      const capacitor = await uiService.createCapacitor({
        userId: body.userId,
        capacity: Math.trunc(body.capacity),
        value: Math.trunc(body.value),
      });

      reply.code(201);
      return capacitor;
    },
  );

  app.put<{ Params: CapacitorParams; Body: UpsertCapacitorBody }>(
    "/api/ui/v1/capacitors/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid capacitor id" };
      }

      const body = request.body ?? {};
      if (!isValidNumber(body.capacity) || !isValidNumber(body.value)) {
        reply.code(400);
        return { error: "capacity and value are required numbers" };
      }

      try {
        return await uiService.updateCapacitor({
          id,
          userId: body.userId,
          capacity: Math.trunc(body.capacity),
          value: Math.trunc(body.value),
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Capacitor not found") {
          reply.code(404);
          return { error: "Capacitor not found" };
        }

        throw error;
      }
    },
  );

  app.delete<{ Params: CapacitorParams }>(
    "/api/ui/v1/capacitors/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid capacitor id" };
      }

      try {
        await uiService.deleteCapacitor(id);
        reply.code(204);
        return null;
      } catch (error) {
        if (error instanceof Error && error.message === "Capacitor not found") {
          reply.code(404);
          return { error: "Capacitor not found" };
        }

        throw error;
      }
    },
  );

  app.get("/api/ui/v1/dashboard/plants", { preHandler: requireUiAuth }, async () => {
    return uiService.listDashboardPlants();
  });

  app.get("/api/ui/v1/dashboard/water-tank", { preHandler: requireUiAuth }, async (_request, reply) => {
    try {
      return await uiService.getDashboardTank();
    } catch (error) {
      if (error instanceof Error && error.message === "Dashboard tank not found") {
        reply.code(404);
        return { error: "Dashboard tank not found" };
      }

      throw error;
    }
  });

  app.post<{ Params: DashboardPlantParams; Body: WaterPlantBody }>(
    "/api/ui/v1/dashboard/plants/:id/water",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const plantId = parseDeviceId(request.params.id);
      if (plantId === null) {
        reply.code(400);
        return { error: "Invalid plant id" };
      }

      const duration = normalizeDuration(request.body?.duration);
      if (duration === null) {
        reply.code(400);
        return { error: "Invalid duration" };
      }

      try {
        await uiService.waterDashboardPlant(plantId, duration);
        return { success: true };
      } catch (error) {
        if (error instanceof Error && error.message === "Plant not found") {
          reply.code(404);
          return { error: "Plant not found" };
        }

        throw error;
      }
    },
  );

  app.get<{ Params: DeviceParams }>("/api/ui/v1/devices/:id", { preHandler: requireUiAuth }, async (request, reply) => {
    const id = parseDeviceId(request.params.id);

    if (id === null) {
      reply.code(400);
      return { error: "Invalid device id" };
    }

    try {
      return await uiService.getDevice(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Device not found") {
        reply.code(404);
        return { error: "Device not found" };
      }

      throw error;
    }
  });

  app.post<{ Body: UpsertDeviceBody }>(
    "/api/ui/v1/devices",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const body = request.body ?? {};

      if (!body.deviceKey?.trim()) {
        reply.code(400);
        return { error: "deviceKey is required" };
      }
      if (
        !isValidNumber(body.sleepDuration)
        || !isValidNumber(body.activityNumber)
        || !isValidNumber(body.checkInterval)
      ) {
        reply.code(400);
        return { error: "sleepDuration, activityNumber and checkInterval are required numbers" };
      }

      const device = await uiService.createDevice({
        name: body.name,
        notes: body.notes,
        deviceKey: body.deviceKey.trim(),
        sleepDuration: Math.trunc(body.sleepDuration),
        activityNumber: Math.trunc(body.activityNumber),
        checkInterval: Math.trunc(body.checkInterval),
      });

      reply.code(201);
      return device;
    },
  );

  app.put<{ Params: DeviceParams; Body: UpsertDeviceBody }>(
    "/api/ui/v1/devices/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid device id" };
      }

      const body = request.body ?? {};
      if (!body.deviceKey?.trim()) {
        reply.code(400);
        return { error: "deviceKey is required" };
      }
      if (
        !isValidNumber(body.sleepDuration)
        || !isValidNumber(body.activityNumber)
        || !isValidNumber(body.checkInterval)
      ) {
        reply.code(400);
        return { error: "sleepDuration, activityNumber and checkInterval are required numbers" };
      }

      try {
        return await uiService.updateDevice({
          id,
          name: body.name,
          notes: body.notes,
          deviceKey: body.deviceKey.trim(),
          sleepDuration: Math.trunc(body.sleepDuration),
          activityNumber: Math.trunc(body.activityNumber),
          checkInterval: Math.trunc(body.checkInterval),
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Device not found") {
          reply.code(404);
          return { error: "Device not found" };
        }

        throw error;
      }
    },
  );

  app.delete<{ Params: DeviceParams }>(
    "/api/ui/v1/devices/:id",
    { preHandler: requireUiAuth },
    async (request, reply) => {
      const id = parseDeviceId(request.params.id);

      if (id === null) {
        reply.code(400);
        return { error: "Invalid device id" };
      }

      try {
        await uiService.deleteDevice(id);
        reply.code(204);
        return null;
      } catch (error) {
        if (error instanceof Error && error.message === "Device not found") {
          reply.code(404);
          return { error: "Device not found" };
        }

        throw error;
      }
    },
  );
}

function parseDeviceId(rawId: string): number | null {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function normalizeDuration(rawDuration: number | undefined): number | null {
  if (rawDuration === undefined) {
    return 30;
  }

  const duration = Math.trunc(rawDuration);
  if (!Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return duration;
}

function isValidNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableNumber(value: number | null | undefined): value is number | null | undefined {
  return value === undefined || value === null || isValidNumber(value);
}

function normalizeActiveFlag(active: boolean | undefined): boolean {
  return active ?? true;
}
