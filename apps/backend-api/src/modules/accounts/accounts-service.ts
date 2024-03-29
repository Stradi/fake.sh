import { ResourceNotFoundError } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { eq } from 'drizzle-orm';
import type { IndexQuery, UpdateBody } from './accounts-dto';
import { accountsTable } from './accounts-schema';

export default class AccountsService {
  private readonly db = getDb();

  public async index(query: IndexQuery) {
    const records = await this.db.query.accounts.findMany({
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
      with: {
        accountGroup: {
          with: {
            group: true,
          },
        },
        projects: query.with_projects || undefined,
      },
    });

    return records;
  }

  public async show(id: string) {
    const records = await this.db.query.accounts.findMany({
      where: eq(accountsTable.id, id),
      with: {
        accountGroup: {
          with: {
            group: true,
          },
        },
        projects: true,
      },
    });

    if (records.length === 0) {
      throw new ResourceNotFoundError('Account', id);
    }

    return records[0];
  }

  public async update(id: string, body: UpdateBody) {
    const records = await this.db
      .update(accountsTable)
      .set({
        email: body.email,
        password_hash: body.password
          ? await Bun.password.hash(body.password, 'argon2i')
          : undefined,
        updated_at: new Date(),
      })
      .where(eq(accountsTable.id, id))
      .returning();

    return records[0];
  }

  public async destroy(id: string) {
    const records = await this.db
      .delete(accountsTable)
      .where(eq(accountsTable.id, id))
      .returning();

    return records[0];
  }
}
