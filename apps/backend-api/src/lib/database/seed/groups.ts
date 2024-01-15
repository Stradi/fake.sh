import { generateId, log } from '@fake.sh/backend-common';
import { groupsTable } from '@modules/groups/groups-schema';
import { eq, sql } from 'drizzle-orm';
// eslint-disable-next-line import/no-cycle -- ¯\_(ツ)_/¯
import { getDb } from '..';

export const DefaultGroups = ['Admin', 'Registered User', 'Paid User'] as const;

export async function seedGroups() {
  for await (const groupName of DefaultGroups) {
    await createGroupOrDie(groupName);
  }
}

async function createGroupOrDie(groupName: string) {
  const db = getDb();

  const exists = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
      id: sql<string>`id`.mapWith(String),
    })
    .from(groupsTable)
    .where(eq(groupsTable.name, groupName))
    .groupBy(groupsTable.id);

  if (exists.length > 0 && exists[0].count > 0) {
    return exists[0];
  }

  const group = await db
    .insert(groupsTable)
    .values({
      id: generateId(),
      name: groupName,
    })
    .onConflictDoNothing()
    .returning();

  if (group.length === 0) {
    log.fatal(`Failed to create group ${groupName}`);
    process.exit(1);
  }

  return group[0];
}
