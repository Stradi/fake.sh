import beNiceMiddleware from '@lib/middlewares/be-nice-middleware';
import errorMiddleware from '@lib/middlewares/error-middleware';
import notFoundMiddleware from '@lib/middlewares/not-found-middleware';
import { log } from '@utils/logger';
import { Hono } from 'hono';

let requestsServed = 0;

export function getServer() {
  const app = new Hono({
    strict: false,
  });

  app.use(
    '*',
    async (_, next) => {
      requestsServed++;
      await next();
    },
    beNiceMiddleware()
  );

  app.onError(errorMiddleware());
  app.notFound(notFoundMiddleware());

  return app;
}

export function addShutdownEventListeners() {
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      log.info(`Received ${signal}, shutting down gracefully...`);
      gracefulShutdown();
    });
  });
}

function gracefulShutdown() {
  const runtime = Bun.nanoseconds() * 1.666667 * 1e-11;

  log.info(
    `API server ran for ${runtime.toFixed(
      2
    )} minutes and served ${requestsServed} requests`
  );

  log.info('See you later!');

  process.exit(0);
}
