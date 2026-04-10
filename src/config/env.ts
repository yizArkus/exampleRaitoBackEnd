import dotenv from 'dotenv';

dotenv.config();

const defaultJwtSecret = 'dev-only-change-me-use-strong-secret-in-production';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
} as const;
