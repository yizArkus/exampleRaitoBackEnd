import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { apiRouter } from './routes';

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (origin === undefined || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
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
