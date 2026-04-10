/**
 * Ejecutado en ECS Run Task (misma task definition que el servicio, command override).
 * Usa las mismas variables / secretos que el contenedor de la app (RDS en VPC).
 *
 * - Bloqueo advisory en PostgreSQL para evitar migraciones concurrentes (varias réplicas / pipelines).
 * - DDL idempotente desde db/migrations/*.sql
 * - Usuario bootstrap idempotente vía bcrypt (BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD).
 */

import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Client, type ClientConfig } from 'pg';

/** Constantes de lock estables entre ejecuciones (no usar random). */
const ADVISORY_KEY_1 = 0x72616974; // 'rait'
const ADVISORY_KEY_2 = 0x6d696772; // 'migr'

const DDL_RELATIVE = '../../db/migrations/20260410120000_initial_users.sql';

function optionalEnv(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v !== undefined && v.trim() !== '') {
      return v.trim();
    }
  }
  return undefined;
}

function buildPgConfig(): ClientConfig {
  const databaseUrl = optionalEnv('DATABASE_URL');
  if (databaseUrl) {
    return { connectionString: databaseUrl };
  }

  const host = optionalEnv('POSTGRES_HOST', 'DB_HOST', 'PGHOST');
  const portRaw = optionalEnv('POSTGRES_PORT', 'DB_PORT', 'PGPORT', 'db_port') ?? '5432';
  const user = optionalEnv('POSTGRES_USER', 'DB_USER', 'PGUSER', 'username', 'db_user');
  const password = optionalEnv(
    'POSTGRES_PASSWORD',
    'DB_PASSWORD',
    'PGPASSWORD',
    'password',
    'db_password'
  );
  const database = optionalEnv(
    'POSTGRES_DB',
    'DB_NAME',
    'PGDATABASE',
    'dbname',
    'database',
    'db_name'
  );

  if (!host || !user || password === undefined || !database) {
    throw new Error(
      'Faltan credenciales de BD: define DATABASE_URL o POSTGRES_* / DB_* (host, user, password, database).'
    );
  }

  const port = Number(portRaw);
  const sslMode = (optionalEnv('PGSSLMODE', 'POSTGRES_SSLMODE') ?? '').toLowerCase();
  const useSsl = sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full';

  return {
    host,
    port: Number.isFinite(port) ? port : 5432,
    user,
    password,
    database,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };
}

async function run(): Promise<void> {
  const config = buildPgConfig();
  const client = new Client(config);

  const ddlPath = path.join(__dirname, DDL_RELATIVE);
  if (!fs.existsSync(ddlPath)) {
    throw new Error(`No se encontró el archivo de migración: ${ddlPath}`);
  }
  const ddl = fs.readFileSync(ddlPath, 'utf8');

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [ADVISORY_KEY_1, ADVISORY_KEY_2]);
    await client.query(ddl);

    const email = optionalEnv('BOOTSTRAP_ADMIN_EMAIL') ?? 'ygonzalez@arkusnexus.com';
    const plainPassword = optionalEnv('BOOTSTRAP_ADMIN_PASSWORD');

    if (plainPassword) {
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      await client.query(
        `INSERT INTO users (email, password_hash, role)
         SELECT $1::text, $2::text, 'admin'::text
         WHERE NOT EXISTS (
           SELECT 1 FROM users WHERE lower(email) = lower($1::text)
         )`,
        [email, passwordHash]
      );
      // eslint-disable-next-line no-console
      console.log('[migrate] Usuario bootstrap comprobado/creado (email idempotente).');
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        '[migrate] BOOTSTRAP_ADMIN_PASSWORD no definido; solo se aplicó DDL (sin seed de admin).'
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end().catch(() => {});
  }
}

void run().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[migrate] Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
