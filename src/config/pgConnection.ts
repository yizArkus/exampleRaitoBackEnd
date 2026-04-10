/**
 * Configuración compartida para `pg` (Pool en la app, Client en migraciones).
 * Variables: DATABASE_URL o DB_* / POSTGRES_* (Secrets Manager en ECS).
 */
import type { ClientConfig } from 'pg';

export function optionalEnv(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v !== undefined && v.trim() !== '') {
      return v.trim();
    }
  }
  return undefined;
}

function isLikelyRdsHost(hostOrUrl: string): boolean {
  return hostOrUrl.includes('.rds.amazonaws.com');
}

function sslOptionFor(hostOrUrl: string, explicitMode: string | undefined): ClientConfig['ssl'] {
  const mode = (explicitMode ?? (isLikelyRdsHost(hostOrUrl) ? 'require' : '')).toLowerCase();
  if (mode === 'disable' || mode === 'allow' || mode === 'prefer') {
    return undefined;
  }
  if (mode === 'require' || mode === 'verify-ca' || mode === 'verify-full') {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export function buildPgConfig(): ClientConfig {
  const databaseUrl = optionalEnv('DATABASE_URL');
  if (databaseUrl) {
    const sslDisabled = /sslmode\s*=\s*disable/i.test(databaseUrl);
    const ssl =
      !sslDisabled && isLikelyRdsHost(databaseUrl)
        ? { rejectUnauthorized: false as const }
        : undefined;
    return {
      connectionString: databaseUrl,
      ...(ssl ? { ssl } : {}),
      connectionTimeoutMillis: 15_000,
    };
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
  const sslMode = optionalEnv('PGSSLMODE', 'POSTGRES_SSLMODE');
  const ssl = sslOptionFor(host, sslMode);

  return {
    host,
    port: Number.isFinite(port) ? port : 5432,
    user,
    password,
    database,
    ssl,
    connectionTimeoutMillis: 15_000,
  };
}
