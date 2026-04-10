import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.port}`);
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log(
      '[cors] allowed origins count:',
      env.allowedOrigins.length,
      env.allowedOrigins.length > 0
        ? `(${env.allowedOrigins.join(', ')})`
        : '(none — set ALLOWED_ORIGINS or CORS_ORIGINS for browser clients)'
    );
  }
});
