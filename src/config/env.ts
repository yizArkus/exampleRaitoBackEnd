import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://dsjggq5txybwy.cloudfront.net',
  /** Front en AWS Amplify (Origin del navegador en preflight CORS). */
  'https://main.dw9dd2io9vp1k.amplifyapp.com',
] as const;

function parseCorsOrigins(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === '') {
    return [...DEFAULT_CORS_ORIGINS];
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
  /** CORS: debe incluir el origen del front (p. ej. Amplify), no solo la URL del API. Si CORS_ORIGINS está vacío se usan los default. */
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
} as const;
