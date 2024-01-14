import { groupsTable } from '@modules/groups/groups-schema';
import { permissionsTable } from '@modules/permissions/permissions-schema';
import { relations } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const groupPermissionTable = sqliteTable(
  'group_permission',
  {
    group_id: text('group_id', { mode: 'text' })
      .notNull()
      .references((): AnySQLiteColumn => groupsTable.id),
    permission_id: text('permission_id', { mode: 'text' })
      .notNull()
      .references((): AnySQLiteColumn => permissionsTable.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.group_id, table.permission_id] }),
    };
  }
);

export const groupPermissionRelations = relations(
  groupPermissionTable,
  ({ one }) => ({
    group: one(groupsTable, {
      fields: [groupPermissionTable.group_id],
      references: [groupsTable.id],
    }),
    permission: one(permissionsTable, {
      fields: [groupPermissionTable.permission_id],
      references: [permissionsTable.id],
    }),
  })
);
