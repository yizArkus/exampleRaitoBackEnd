-- Migración idempotente: esquema mínimo de usuarios + admin inicial (si no existe).
-- Hash bcrypt (cost 10) para la contraseña de bootstrap; rotar en producción.

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

INSERT INTO users (email, password_hash, role)
SELECT
  'ygonzalez@arkusnexus.com',
  '$2b$10$u2e0KOYcbCaSsp31osfeleqNMH.q/O8u7GmB1uBN88ks/oI698vA6',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE lower(email) = lower('ygonzalez@arkusnexus.com')
);
