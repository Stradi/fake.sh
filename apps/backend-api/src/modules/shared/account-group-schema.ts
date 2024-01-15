import { accountsTable } from '@modules/accounts/accounts-schema';
import { groupsTable } from '@modules/groups/groups-schema';
import { relations } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

export const accountGroupTable = pgTable(
  'account_group',
  {
    account_id: text('account_id')
      .notNull()
      .references((): AnyPgColumn => accountsTable.id),
    group_id: text('group_id')
      .notNull()
      .references((): AnyPgColumn => groupsTable.id),
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
