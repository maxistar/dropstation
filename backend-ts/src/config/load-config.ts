export interface AppConfig {
  host: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
  corsOrigin: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 3001;
const DEFAULT_NODE_ENV = "development";
const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_CORS_ORIGIN = "http://localhost:3000";
const DEFAULT_DB_HOST = "db";
const DEFAULT_DB_PORT = 3306;
const DEFAULT_DB_NAME = "dropstation";
const DEFAULT_DB_USER = "root";
const DEFAULT_DB_PASSWORD = "gotechnies";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const rawPort = env.PORT ?? `${DEFAULT_PORT}`;
  const port = Number.parseInt(rawPort, 10);
  const rawDbPort = env.DB_PORT ?? `${DEFAULT_DB_PORT}`;
  const dbPort = Number.parseInt(rawDbPort, 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  if (Number.isNaN(dbPort) || dbPort <= 0) {
    throw new Error(`Invalid DB_PORT value: ${rawDbPort}`);
  }

  return {
    host: env.HOST ?? DEFAULT_HOST,
    port,
    nodeEnv: env.NODE_ENV ?? DEFAULT_NODE_ENV,
    logLevel: env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
    corsOrigin: env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
    dbHost: env.DB_HOST ?? DEFAULT_DB_HOST,
    dbPort,
    dbName: env.DB_NAME ?? DEFAULT_DB_NAME,
    dbUser: env.DB_USER ?? DEFAULT_DB_USER,
    dbPassword: env.DB_PASSWORD ?? DEFAULT_DB_PASSWORD,
  };
}
