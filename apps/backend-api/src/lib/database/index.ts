import { log } from '@fake.sh/backend-common';
import Database from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import fs from 'node:fs/promises';

export function getDb() {
  const file = new Database('./data/main.sqlite', {
    create: true,
  });

  return drizzle(file, {
    schema: {},
  });
}

export async function runMigrations() {
  await fs.mkdir('./data', { recursive: true });
  migrate(getDb(), {
    migrationsFolder: './src/lib/database/generated',
  });

  log.info('All migrations ran successfully');
}
