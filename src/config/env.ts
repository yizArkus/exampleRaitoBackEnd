import dotenv from 'dotenv';

dotenv.config();

const defaultJwtSecret = 'dev-only-change-me-use-strong-secret-in-production';

/**
 * Normalizes a browser Origin for comparison (trims; strips trailing slash on http(s) URLs).
 */
export function normalizeOrigin(o: string): string {
  const t = o.trim();
  if (t.length === 0) {
    return t;
  }
  if (/^https?:\/\//i.test(t) && t.endsWith('/')) {
    return t.replace(/\/+$/, '');
  }
  return t;
}

/**
 * Comma-separated browser origins (Amplify, local dev, etc.).
 * ALLOWED_ORIGINS preferred; CORS_ORIGINS is an alias for secrets that use that JSON key.
 */
function parseAllowedOrigins(raw: string | undefined): readonly string[] {
  if (raw === undefined || raw.trim() === '') {
    return [];
  }
  const list = raw
    .split(',')
    .map(s => normalizeOrigin(s))
    .filter(s => s.length > 0);
  return [...new Set(list)];
}

const corsRaw = process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGINS;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  /** Allowed CORS origins. Empty disables cross-origin browser access (curl/non-browser still work). */
  allowedOrigins: parseAllowedOrigins(corsRaw),
} as const;
