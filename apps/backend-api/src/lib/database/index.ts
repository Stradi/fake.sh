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
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// eslint-disable-next-line import/no-cycle -- ¯\_(ツ)_/¯
import { seedGroups } from './seed/groups';
// eslint-disable-next-line import/no-cycle -- ¯\_(ツ)_/¯
import { seedPermissions } from './seed/permissions';

let client: postgres.Sql | null = null;

export function getDb() {
  if (!client) {
    client = postgres('postgres://postgres:postgres@localhost:5432', {
      max: 5,
    });
  }

  return drizzle(client, {
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
  const migrationClient = postgres(
    'postgres://postgres:postgres@localhost:5432',
    {
      max: 1,
    }
  );
  const db = drizzle(migrationClient);

  await migrate(db, {
    migrationsFolder: `${import.meta.dir}/generated`,
  });

  log.info('All migrations ran successfully');
}

export async function seedDatabase() {
  await seedGroups();
  await seedPermissions();
}
