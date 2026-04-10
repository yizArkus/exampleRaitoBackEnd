import { getPool } from '../db/pool';
import type { UserRecord } from '../types/user';

/**
 * Busca usuario por email en PostgreSQL (tabla `users` de la migración).
 * Esquema: columna `email`, no `username`.
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const pool = getPool();
  const normalized = email.trim();
  const result = await pool.query<{
    id: string;
    email: string;
    password_hash: string;
  }>(
    `SELECT id::text AS id, email, password_hash
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [normalized]
  );

  if (result.rows.length === 0 || result.rows[0] === undefined) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
  };
}
