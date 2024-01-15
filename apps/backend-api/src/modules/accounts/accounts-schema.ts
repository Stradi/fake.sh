import { accountGroupTable } from '@modules/shared/account-group-schema';
import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const accountsTable = pgTable('accounts', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
});

export const accountsRelations = relations(accountsTable, ({ many }) => ({
  accountGroup: many(accountGroupTable),
}));
