import mysql, { type Pool, type PoolOptions } from "mysql2/promise";
import type { AppConfig } from "../config/load-config.js";

export type DatabasePool = Pool;

export function createMysqlPool(config: AppConfig): DatabasePool {
  const options: PoolOptions = {
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
  };

  return mysql.createPool(options);
}
