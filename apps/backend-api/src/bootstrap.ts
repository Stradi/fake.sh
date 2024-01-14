import {
  beNiceMiddleware,
  errorMiddleware,
  log,
  loggerMiddleware,
  notFoundMiddleware,
} from '@fake.sh/backend-common';
import authMiddleware from '@lib/middlewares/auth-middleware';
import { AccountsController } from '@modules/accounts/accounts-controller';
import AuthController from '@modules/auth/auth-controller';
import GroupsController from '@modules/groups/groups-controller';
import PermissionsController from '@modules/permissions/permissions-controller';
import ProjectsController from '@modules/projects/projects-controller';
import SchemasController from '@modules/schemas/schemas-controller';
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
    beNiceMiddleware(),
    authMiddleware()
  );

  app.onError(errorMiddleware());
  app.notFound(notFoundMiddleware());

  // NOTE: Save without formatting pls.
  app.route('/api/v1', new ProjectsController({ resourceName: 'projects' }).router());
  app.route('/api/v1/projects/:projectId', new SchemasController({ resourceName: 'schemas', handlerParamName: 'schemaId'}).router());
  app.route('/api/v1', new AccountsController({ resourceName: 'accounts' }).router());
  app.route('/api/v1', new AuthController().router());
  app.route('/api/v1', new GroupsController({ resourceName: 'groups' }).router());
  app.route('/api/v1', new PermissionsController({ resourceName: 'permissions' }).router());

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
