import { env } from '@fake.sh/backend-common';
import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    connectionString: env('PG_CONNECTION_STRING', ''),
  },
});

export default db;
