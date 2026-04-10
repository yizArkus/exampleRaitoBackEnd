-- Migración idempotente: esquema mínimo de usuarios.
-- Usuario inicial: src/scripts/run-migrations.ts (ygonzalez@arkusnexus.com, bcrypt; default admin123 o BOOTSTRAP_ADMIN_PASSWORD).

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
