import Fastify, { type FastifyInstance } from "fastify";
import type { AppConfig } from "../config/load-config.js";
import type { DatabaseContext } from "../db/index.js";
import { registerRuntimeRoutes } from "../routes/runtime/register-runtime-routes.js";
import { registerUiRoutes } from "../routes/ui/register-ui-routes.js";

export function buildServer(
  config: AppConfig,
  database: DatabaseContext,
): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.logLevel,
    },
  });

  app.addHook("onRequest", async (request, reply) => {
    const requestOrigin = request.headers.origin;

    if (requestOrigin && config.corsOrigins.includes(requestOrigin)) {
      reply.header("Access-Control-Allow-Origin", requestOrigin);
      reply.header("Vary", "Origin");
      reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (request.method === "OPTIONS") {
      reply.code(204).send();
    }
  });

  app.get("/", async () => {
    return {
      service: "dropstation-backend-ts",
      environment: config.nodeEnv,
      status: "ok",
    };
  });

  app.get("/health", async () => {
    return {
      service: "dropstation-backend-ts",
      status: "ok",
    };
  });

  registerUiRoutes(app, database);
  registerRuntimeRoutes(app, database);

  return app;
}
