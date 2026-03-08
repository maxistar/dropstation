import type { FastifyInstance } from "fastify";
import { UiService } from "../../modules/ui/ui-service.js";
import type { DatabaseContext } from "../../db/index.js";

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
}

interface WaterPlantBody {
  duration?: number;
}

export function registerUiRoutes(
  app: FastifyInstance,
  database: DatabaseContext,
): void {
  const uiService = new UiService(database);

  app.get("/api/ui/v1", async () => {
    return {
      service: "dropstation-backend-ts",
      status: "ok",
    };
  });

  app.get("/api/ui/v1/devices", async () => {
    return uiService.listDevices();
  });

  app.get("/api/ui/v1/points", async () => {
    return uiService.listPoints();
  });

  app.get("/api/ui/v1/dashboard/plants", async () => {
    return uiService.listDashboardPlants();
  });

  app.get("/api/ui/v1/dashboard/water-tank", async (_request, reply) => {
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

  app.get<{ Params: DeviceParams }>("/api/ui/v1/devices/:id", async (request, reply) => {
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
    async (request, reply) => {
      const body = request.body ?? {};

      if (!body.deviceKey?.trim()) {
        reply.code(400);
        return { error: "deviceKey is required" };
      }

      const device = await uiService.createDevice({
        name: body.name,
        notes: body.notes,
        deviceKey: body.deviceKey.trim(),
      });

      reply.code(201);
      return device;
    },
  );

  app.put<{ Params: DeviceParams; Body: UpsertDeviceBody }>(
    "/api/ui/v1/devices/:id",
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

      try {
        return await uiService.updateDevice({
          id,
          name: body.name,
          notes: body.notes,
          deviceKey: body.deviceKey.trim(),
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
