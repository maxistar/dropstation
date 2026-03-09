import type { FastifyInstance } from "fastify";
import { RuntimeService } from "../../modules/runtime/runtime-service.js";
import type { DatabaseContext } from "../../db/index.js";

interface RuntimeWateringQuerystring {
  device: string;
  ttt?: string;
}

export function registerRuntimeRoutes(
  app: FastifyInstance,
  database: DatabaseContext,
): void {
  const runtimeService = new RuntimeService(database);

  app.get<{ Querystring: RuntimeWateringQuerystring }>(
    "/api/device/v1/watering",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["device"],
          properties: {
            device: { type: "string", minLength: 1 },
            ttt: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await runtimeService.handleWateringPoll(request.query);
        return result;
      } catch (error) {
        request.log.error(error);

        if (error instanceof Error && error.message === "Device not found") {
          reply.code(404);
          return {
            error: "Device not found",
          };
        }

        if (error instanceof Error && error.message === "Invalid ttt payload") {
          reply.code(400);
          return {
            error: "Invalid ttt payload",
          };
        }

        reply.code(500);
        return {
          error: "Runtime watering request failed",
        };
      }
    },
  );
}
