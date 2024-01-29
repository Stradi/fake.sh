import { log } from '@fake.sh/backend-common';
import { groupsTable } from '@modules/groups/groups-schema';
import { permissionsTable } from '@modules/permissions/permissions-schema';
import { groupPermissionTable } from '@modules/shared/group-permission-schema';
import { and, eq, sql } from 'drizzle-orm';
// eslint-disable-next-line import/no-cycle -- ¯\_(ツ)_/¯
import { getDb } from '..';
import { DefaultGroups } from './groups';

type Resource = 'Project' | 'Schema' | 'Account' | 'Group' | 'Permission';
type Scope = string;
type BaseActions = 'Index' | 'Show' | 'Create' | 'Update' | 'Destroy';

type GeneralActions = 'CanViewAdminPanel';
type SchemaActions = 'GetLogs' | 'GetUsage';

type Action = BaseActions | GeneralActions | SchemaActions;

type PermissionString =
  | `General.${GeneralActions}`
  | `${Resource}.${Scope}.${Action}`
  | `${Resource}.${Action}`;

const DefaultPermissionMatrix: Record<
  (typeof DefaultGroups)[number],
  PermissionString[]
> = {
  Admin: [
    'General.CanViewAdminPanel',

    'Project.Create',
    'Project.Index',
    'Project.*.Show',
    'Project.*.Update',
    'Project.*.Destroy',
    'Project.&.Update',
    'Project.&.Destroy',

    'Schema.Create',
    'Schema.Index',
    'Schema.*.Show',
    'Schema.*.Update',
    'Schema.*.Destroy',
    'Schema.*.GetLogs',
    'Schema.*.GetUsage',
    'Schema.&.Update',
    'Schema.&.Destroy',

    'Account.Create',
    'Account.Index',
    'Account.*.Show',
    'Account.*.Update',
    'Account.*.Destroy',
    'Account.&.Update',
    'Account.&.Destroy',

    'Group.Create',
    'Group.Index',
    'Group.*.Show',
    'Group.*.Update',
    'Group.*.Destroy',

    'Permission.Create',
    'Permission.Index',
    'Permission.*.Show',
    'Permission.*.Update',
    'Permission.*.Destroy',
  ],
  'Registered User': [
    'Project.Create',
    'Project.&.Show',
    'Project.&.Update',
    'Project.&.Destroy',

    'Schema.Create',
    'Schema.&.Show',
    'Schema.&.GetLogs',
    'Schema.&.GetUsage',

    'Account.&.Show',
    'Account.&.Update',
    'Account.&.Destroy',
  ],
  'Paid User': [
    'Project.Create',
    'Project.&.Show',
    'Project.&.Update',
    'Project.&.Destroy',

    'Schema.Create',
    'Schema.&.Show',
    'Schema.&.GetLogs',
    'Schema.&.GetUsage',

    'Account.&.Show',
    'Account.&.Update',
    'Account.&.Destroy',
  ],
  Anonymous: [],
};

export async function seedPermissions() {
  for await (const groupName of DefaultGroups) {
    for await (const permissionName of DefaultPermissionMatrix[groupName]) {
      const permission = await createPermissionOrDie(permissionName);
      await createGroupPermissionOrDie(groupName, permission.id);
    }
  }
}

async function createPermissionOrDie(permissionName: string) {
  const db = getDb();

  const exists = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
      id: sql<string>`id`.mapWith(String),
    })
    .from(permissionsTable)
    .where(eq(permissionsTable.name, permissionName))
    .groupBy(permissionsTable.id);

  if (exists.length > 0 && exists[0].count > 0) {
    return exists[0];
  }

  const permission = await db
    .insert(permissionsTable)
    .values({
      id: permissionName,
      name: permissionName,
    })
    .onConflictDoNothing()
    .returning();

  if (permission.length === 0) {
    log.fatal(`Failed to create permission ${permissionName}`);
    process.exit(1);
  }

  return permission[0];
}

async function createGroupPermissionOrDie(
  groupName: string,
  permissionId: string
) {
  const db = getDb();

  const group = await db.query.groups.findMany({
    where: eq(groupsTable.name, groupName),
  });

  if (group.length === 0) {
    log.fatal(
      `Failed to find group ${groupName}, can't create permission ${permissionId}`
    );
    process.exit(1);
  }

  const exists = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(groupPermissionTable)
    .where(
      and(
        eq(groupPermissionTable.group_id, group[0].id),
        eq(groupPermissionTable.permission_id, permissionId)
      )
    );

  if (exists[0].count > 0) {
    return exists[0];
  }

  const groupPermission = await db
    .insert(groupPermissionTable)
    .values({
      group_id: group[0].id,
      permission_id: permissionId,
    })
    .onConflictDoNothing()
    .returning();

  if (groupPermission.length === 0) {
    log.fatal(`Failed to create group permission ${groupName} ${permissionId}`);
    process.exit(1);
  }

  return groupPermission[0];
}
