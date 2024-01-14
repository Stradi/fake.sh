import { log } from '@fake.sh/backend-common';
import {
  accountsRelations,
  accountsTable,
} from '@modules/accounts/accounts-schema';
import { groupsRelations, groupsTable } from '@modules/groups/groups-schema';
import {
  permissionsRelations,
  permissionsTable,
} from '@modules/permissions/permissions-schema';
import {
  projectsRelations,
  projectsTable,
} from '@modules/projects/projects-schema';
import {
  schemasRelations,
  schemasTable,
} from '@modules/schemas/schemas-schema';
import {
  accountGroupRelations,
  accountGroupTable,
} from '@modules/shared/account-group-schema';
import {
  groupPermissionRelations,
  groupPermissionTable,
} from '@modules/shared/group-permission-schema';
import Database from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import fs from 'node:fs/promises';

export function getDb() {
  const file = new Database(`${process.cwd()}/data/main.sqlite`, {
    create: true,
  });

  return drizzle(file, {
    schema: {
      projects: projectsTable,
      projectsRelations,

      schemas: schemasTable,
      schemasRelations,

      accounts: accountsTable,
      accountsRelations,

      permissions: permissionsTable,
      permissionsRelations,

      groups: groupsTable,
      groupsRelations,

      accountGroup: accountGroupTable,
      accountGroupRelations,

      groupPermission: groupPermissionTable,
      groupPermissionRelations,
    },
  });
}

export async function runMigrations() {
  await fs.mkdir('./data', { recursive: true });
  migrate(getDb(), {
    migrationsFolder: `${import.meta.dir}/generated`,
  });

  log.info('All migrations ran successfully');
}
