import type { RowDataPacket } from "mysql2";
import type { DatabasePool } from "../../db/create-mysql-pool.js";

export interface UiAuthUserRecord {
  id: number;
  login: string;
  email: string | null;
  passwordHash: string | null;
  active: boolean;
}

type UiAuthUserRow = RowDataPacket & {
  id: number;
  login: string;
  email: string | null;
  passwordHash: string | null;
  active: number;
};

export interface UiAuthRepository {
  findByIdentifier(identifier: string): Promise<UiAuthUserRecord | null>;
}

export function createUiAuthRepository(pool: DatabasePool): UiAuthRepository {
  return {
    async findByIdentifier(identifier) {
      const [rows] = await pool.query<UiAuthUserRow[]>(
        `
          SELECT
            u.id,
            u.login,
            u.email,
            u.password_hash AS passwordHash,
            u.active
          FROM users u
          WHERE u.login = ? OR u.email = ?
          LIMIT 1
        `,
        [identifier, identifier],
      );

      const row = rows[0];
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        login: row.login,
        email: row.email,
        passwordHash: row.passwordHash,
        active: row.active === 1,
      };
    },
  };
}
