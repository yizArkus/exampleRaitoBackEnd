import dotenv from 'dotenv';

dotenv.config();

function parseCorsOrigins(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === '') {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

const defaultJwtSecret = 'dev-only-change-me-use-strong-secret-in-production';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  /** Orígenes permitidos para el front (CORS). Lista separada por comas en CORS_ORIGINS. */
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
} as const;
