import type { FastifyInstance } from "fastify";

export function registerUiRoutes(app: FastifyInstance): void {
  app.get("/api/ui/v1", async () => {
    return {
      service: "dropstation-backend-ts",
      status: "not_implemented",
    };
  });
}
