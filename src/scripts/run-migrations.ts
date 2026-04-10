/**
 * Ejecutado en ECS Run Task (misma task definition que el servicio, command override).
 * Usa las mismas variables / secretos que el contenedor de la app (RDS en VPC).
 *
 * - Bloqueo advisory en PostgreSQL para evitar migraciones concurrentes (varias réplicas / pipelines).
 * - DDL idempotente desde db/migrations/*.sql
 * - Usuario bootstrap idempotente: ygonzalez@arkusnexus.com / admin123 por defecto (sobrescribible con env).
 */

import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { buildPgConfig, optionalEnv } from '../config/pgConnection';

/** Constantes de lock estables entre ejecuciones (no usar random). */
const ADVISORY_KEY_1 = 0x72616974; // 'rait'
const ADVISORY_KEY_2 = 0x6d696772; // 'migr'

const DDL_RELATIVE = '../../db/migrations/20260410120000_initial_users.sql';

const DEFAULT_BOOTSTRAP_EMAIL = 'ygonzalez@arkusnexus.com';
/** Solo desarrollo / bootstrap; en producción define BOOTSTRAP_ADMIN_PASSWORD en Secrets Manager. */
const DEFAULT_BOOTSTRAP_PASSWORD = 'admin123';

function logFailure(err: unknown): void {
  if (err && typeof err === 'object') {
    const o = err as { message?: string; code?: string; detail?: string; severity?: string };
    // eslint-disable-next-line no-console
    console.error(
      '[migrate] PostgreSQL / error:',
      JSON.stringify({
        message: o.message,
        code: o.code,
        detail: o.detail,
        severity: o.severity,
      })
    );
  } else {
    // eslint-disable-next-line no-console
    console.error('[migrate] Error:', err);
  }
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

    const email = optionalEnv('BOOTSTRAP_ADMIN_EMAIL') ?? DEFAULT_BOOTSTRAP_EMAIL;
    const plainPassword = optionalEnv('BOOTSTRAP_ADMIN_PASSWORD') ?? DEFAULT_BOOTSTRAP_PASSWORD;

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

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end().catch(() => {});
  }
}

void run().catch((err: unknown) => {
  logFailure(err);
  process.exit(1);
});
