import { createApp, CORS_ORIGIN_AMPLIFY } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${env.port}`);
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('[cors] Origen permitido:', CORS_ORIGIN_AMPLIFY);
  }
});
