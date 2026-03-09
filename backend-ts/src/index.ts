import "dotenv/config";
import { buildServer } from "./app/build-server.js";
import { loadConfig } from "./config/load-config.js";
import { createDatabaseContext } from "./db/index.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const database = createDatabaseContext(config);
  const app = buildServer(config, database);

  app.log.info(
    {
      host: config.host,
      port: config.port,
      environment: config.nodeEnv,
      dbHost: config.dbHost,
      dbPort: config.dbPort,
      dbName: config.dbName,
    },
    "Starting Dropstation TypeScript backend",
  );

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
