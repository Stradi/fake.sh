import { log } from '@fake.sh/backend-common';
import beNiceMiddleware from '@lib/middlewares/be-nice-middleware';
import errorMiddleware from '@lib/middlewares/error-middleware';
import loggerMiddleware from '@lib/middlewares/logger-middleware';
import notFoundMiddleware from '@lib/middlewares/not-found-middleware';
import TenantController from '@modules/tenant/tenant-controller';
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
    loggerMiddleware(),
    beNiceMiddleware()
  );

  app.onError(errorMiddleware());
  app.notFound(notFoundMiddleware());

  // TODO: Maybe generate openapi ui at `api/:version` route?
  app.route('/api/:version/:resource', new TenantController().router());

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
