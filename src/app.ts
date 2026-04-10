import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { apiRouter } from './routes';

/** Set explícito: env + producción (Amplify / CloudFront front) por si el despliegue no trae env.ts actualizado. */
function buildCorsAllowlist(): Set<string> {
  return new Set<string>([
    ...env.corsOrigins,
    'https://main.dw9dd2io9vp1k.amplifyapp.com',
    'https://dsjggq5txybwy.cloudfront.net',
  ]);
}

export function createApp(): express.Application {
  const app = express();
  const corsAllow = buildCorsAllowlist();

  app.use(
    cors({
      origin(origin, callback) {
        if (origin === undefined) {
          callback(null, true);
          return;
        }
        const o = origin.trim();
        if (corsAllow.has(o)) {
          callback(null, true);
          return;
        }
        // Sin esto el preflight devuelve 204 sin Access-Control-Allow-Origin (el navegador bloquea).
        // eslint-disable-next-line no-console
        console.warn('[cors] Origen no permitido:', o);
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // Lista no restringida: el middleware refleja Access-Control-Request-Headers en preflight.
      optionsSuccessStatus: 204,
    })
  );

  app.use(express.json());

  /** Auth también en /auth/* (además de /api/auth/*) para clientes que usen URL sin prefijo /api. */
  app.use('/auth', authRoutes);

  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso no encontrado.',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
