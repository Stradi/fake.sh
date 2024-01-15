import { env } from '@fake.sh/backend-common';
import postgres from 'postgres';

const db = postgres(env('PG_CONNECTION_STRING', ''));
export default db;
