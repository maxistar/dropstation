import type { AppConfig } from "../config/load-config.js";
import {
  createMysqlPool,
  type DatabasePool,
} from "./create-mysql-pool.js";
import type { PoolConnection } from "mysql2/promise";

export interface DatabaseContext {
  pool: DatabasePool;
  withTransaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T>;
}

export function createDatabaseContext(config: AppConfig): DatabaseContext {
  return {
    pool: createMysqlPool(config),
    async withTransaction(callback) {
      const connection = await this.pool.getConnection();

      try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
  };
}
