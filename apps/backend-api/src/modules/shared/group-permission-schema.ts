import { groupsTable } from '@modules/groups/groups-schema';
import { permissionsTable } from '@modules/permissions/permissions-schema';
import { relations } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

export const groupPermissionTable = pgTable(
  'group_permission',
  {
    group_id: text('group_id')
      .notNull()
      .references((): AnyPgColumn => groupsTable.id, {
        onDelete: 'cascade',
      }),
    permission_id: text('permission_id')
      .notNull()
      .references((): AnyPgColumn => permissionsTable.id, {
        onDelete: 'cascade',
      }),
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
