import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountsTable = sqliteTable('accounts', {
  id: text('id', { mode: 'text' }).primaryKey().notNull(),
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  email: text('email', { mode: 'text' }).notNull().unique(),
  password_hash: text('password_hash', { mode: 'text' }).notNull(),
});
