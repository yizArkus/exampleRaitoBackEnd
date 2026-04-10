import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { apiRouter } from './routes';

/** Único origen permitido (AWS Amplify). */
export const CORS_ORIGIN_AMPLIFY = 'https://main.dw9dd2io9vp1k.amplifyapp.com';

export function createApp(): express.Application {
  const app = express();

  // Debe ir antes de cualquier ruta (incl. /auth, /api).
  app.use(
    cors({
      origin: CORS_ORIGIN_AMPLIFY,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Amz-Date',
        'X-Api-Key',
        'X-Amz-Security-Token',
      ],
      credentials: true,
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
