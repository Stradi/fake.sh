import { env, generateId, log } from '@fake.sh/backend-common';
import { accountsTable } from '@modules/accounts/accounts-schema';
import { groupsTable } from '@modules/groups/groups-schema';
import { accountGroupTable } from '@modules/shared/account-group-schema';
import { eq, or, sql } from 'drizzle-orm';
// eslint-disable-next-line import/no-cycle -- ¯\_(ツ)_/¯
import { getDb } from '..';

export async function seedAccounts() {
  const db = getDb();

  const exists = await db
    .select({
      count: sql<number>`COUNT(*)`.mapWith(Number),
      id: sql<string>`id`.mapWith(String),
    })
    .from(accountsTable)
    .where(eq(accountsTable.email, env('ADMIN_EMAIL', '')))
    .groupBy(accountsTable.id);

  if (exists.length > 0 && exists[0].count > 0) {
    return exists[0];
  }

  const account = await db
    .insert(accountsTable)
    .values({
      id: generateId(),
      email: env('ADMIN_EMAIL', ''),
      password_hash: await Bun.password.hash(
        env('ADMIN_PASSWORD', ''),
        'argon2i'
      ),
    })
    .onConflictDoNothing()
    .returning();

  if (account.length === 0) {
    log.fatal(`Failed to create account ${env('ADMIN_EMAIL', '')}`);
    process.exit(1);
  }

  const groups = await db.query.groups.findMany({
    where: or(
      eq(groupsTable.name, 'Admin'),
      eq(groupsTable.name, 'Registered User')
    ),
  });

  if (!groups.length || groups.length !== 2) {
    log.fatal(`Failed to find groups Admin and Registered User`);
    process.exit(1);
  }

  const ac = await db
    .insert(accountGroupTable)
    .values([
      {
        account_id: account[0].id,
        group_id: groups[0].id,
      },
      {
        account_id: account[0].id,
        group_id: groups[1].id,
      },
    ])
    .returning();

  if (ac.length !== 2) {
    log.fatal(`Failed to create account group`);
    process.exit(1);
  }
}
