import { accountGroupTable } from '@modules/shared/account-group-schema';
import { groupPermissionTable } from '@modules/shared/group-permission-schema';
import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const groupsTable = pgTable('groups', {
  id: text('id').primaryKey().notNull(),
  created_at: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  name: text('name').notNull().unique(),
});

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  accountGroup: many(accountGroupTable),
  groupPermission: many(groupPermissionTable),
}));
