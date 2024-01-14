import { env, log } from '@fake.sh/backend-common';
import { runMigrations } from '@lib/database';
import { addShutdownEventListeners, getServer } from 'bootstrap';

addShutdownEventListeners();
await runMigrations();

const port = env('PORT', 3000);
Bun.serve({
  development: env('NODE_ENV', 'development') === 'development',
  port,
  fetch(request, server) {
    const app = getServer();
    return app.fetch(request, server);
  },
});

log.info(`API server started on localhost:${port}`);
