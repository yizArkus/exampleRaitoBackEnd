import cors from 'cors';
import express from 'express';
import { env, normalizeOrigin } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { apiRouter } from './routes';

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (origin === undefined) {
          callback(null, true);
          return;
        }
        if (env.allowedOrigins.includes(normalizeOrigin(origin))) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Amz-Date',
        'X-Api-Key',
        'X-Amz-Security-Token',
      ],
      optionsSuccessStatus: 204,
    })
  );

  app.use(express.json());
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
