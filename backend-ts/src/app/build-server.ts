import cors from "@fastify/cors";
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

  app.register(cors, {
    origin: config.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

  registerUiRoutes(app, database, config);
  registerRuntimeRoutes(app, database);

  return app;
}
