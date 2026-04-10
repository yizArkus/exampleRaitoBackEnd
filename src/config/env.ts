import dotenv from 'dotenv';

dotenv.config();

const defaultJwtSecret = 'dev-only-change-me-use-strong-secret-in-production';

/**
 * Comma-separated browser origins for CORS (e.g. Amplify, local Vite).
 * Injected from AWS Secrets Manager or task environment variables.
 */
function parseAllowedOrigins(raw: string | undefined): readonly string[] {
  if (raw === undefined || raw.trim() === '') {
    return [];
  }
  const list = raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return [...new Set(list)];
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  /** Allowed CORS origins (ALLOWED_ORIGINS). Empty means no cross-origin reflection (non-browser clients still work). */
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
} as const;
