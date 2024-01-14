import { accountsTable } from '@modules/accounts/accounts-schema';
import { groupsTable } from '@modules/groups/groups-schema';
import { relations } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { integer, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core';

export const accountGroupTable = sqliteTable(
  'account_group',
  {
    account_id: integer('account_id', { mode: 'number' })
      .notNull()
      .references((): AnySQLiteColumn => accountsTable.id),
    group_id: integer('group_id', { mode: 'number' })
      .notNull()
      .references((): AnySQLiteColumn => groupsTable.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.account_id, table.group_id] }),
    };
  }
);

export const accountGroupRelations = relations(
  accountGroupTable,
  ({ one }) => ({
    account: one(accountsTable, {
      fields: [accountGroupTable.account_id],
      references: [accountsTable.id],
    }),
    group: one(groupsTable, {
      fields: [accountGroupTable.group_id],
      references: [groupsTable.id],
    }),
  })
);
