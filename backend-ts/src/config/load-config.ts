export interface AppConfig {
  host: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
  corsOrigins: string[];
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  authUsername: string;
  authPassword: string;
  authTokenSecret: string;
  authTokenTtlSeconds: number;
}

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 3001;
const DEFAULT_NODE_ENV = "development";
const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_CORS_ORIGIN = "http://localhost:3000";
const DEFAULT_CORS_ADDITIONAL_ORIGIN = "http://localhost:4200";
const DEFAULT_DB_HOST = "db";
const DEFAULT_DB_PORT = 3306;
const DEFAULT_DB_NAME = "dropstation";
const DEFAULT_DB_USER = "root";
const DEFAULT_DB_PASSWORD = "gotechnies";
const DEFAULT_AUTH_USERNAME = "admin";
const DEFAULT_AUTH_PASSWORD = "admin";
const DEFAULT_AUTH_TOKEN_SECRET = "change-me-in-production";
const DEFAULT_AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 8;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const rawPort = env.PORT ?? `${DEFAULT_PORT}`;
  const port = Number.parseInt(rawPort, 10);
  const rawDbPort = env.DB_PORT ?? `${DEFAULT_DB_PORT}`;
  const dbPort = Number.parseInt(rawDbPort, 10);
  const rawTokenTtl = env.AUTH_TOKEN_TTL_SECONDS ?? `${DEFAULT_AUTH_TOKEN_TTL_SECONDS}`;
  const authTokenTtlSeconds = Number.parseInt(rawTokenTtl, 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  if (Number.isNaN(dbPort) || dbPort <= 0) {
    throw new Error(`Invalid DB_PORT value: ${rawDbPort}`);
  }

  if (Number.isNaN(authTokenTtlSeconds) || authTokenTtlSeconds <= 0) {
    throw new Error(`Invalid AUTH_TOKEN_TTL_SECONDS value: ${rawTokenTtl}`);
  }

  return {
    host: env.HOST ?? DEFAULT_HOST,
    port,
    nodeEnv: env.NODE_ENV ?? DEFAULT_NODE_ENV,
    logLevel: env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
    corsOrigins: parseCorsOrigins(env),
    dbHost: env.DB_HOST ?? DEFAULT_DB_HOST,
    dbPort,
    dbName: env.DB_NAME ?? DEFAULT_DB_NAME,
    dbUser: env.DB_USER ?? DEFAULT_DB_USER,
    dbPassword: env.DB_PASSWORD ?? DEFAULT_DB_PASSWORD,
    authUsername: env.AUTH_USERNAME ?? DEFAULT_AUTH_USERNAME,
    authPassword: env.AUTH_PASSWORD ?? DEFAULT_AUTH_PASSWORD,
    authTokenSecret: env.AUTH_TOKEN_SECRET ?? DEFAULT_AUTH_TOKEN_SECRET,
    authTokenTtlSeconds,
  };
}

function parseCorsOrigins(env: NodeJS.ProcessEnv): string[] {
  const primary = (env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN).trim();
  const additional = (env.CORS_ADDITIONAL_ORIGIN ?? DEFAULT_CORS_ADDITIONAL_ORIGIN).trim();
  const explicitList = (env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const normalized = explicitList.length > 0 ? explicitList : [primary, additional];
  return [...new Set(normalized)];
}
