import { accountsTable } from '@modules/accounts/accounts-schema';
import { groupsTable } from '@modules/groups/groups-schema';
import { relations } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountGroupTable = sqliteTable(
  'account_group',
  {
    account_id: text('account_id', { mode: 'text' })
      .notNull()
      .references((): AnySQLiteColumn => accountsTable.id),
    group_id: text('group_id', { mode: 'text' })
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
