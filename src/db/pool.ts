import { Pool } from 'pg';
import { buildPgConfig } from '../config/pgConnection';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool === null) {
    pool = new Pool({
      ...buildPgConfig(),
      max: 10,
    });
  }
  return pool;
}
