import { ResourceNotFoundError, generateId } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { eq } from 'drizzle-orm';
import type { CreateBody, IndexQuery, UpdateBody } from './permissions-dto';
import { permissionsTable } from './permissions-schema';

export default class PermissionsService {
  private readonly db = getDb();

  public async index(query: IndexQuery) {
    const records = await this.db.query.permissions.findMany({
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
      with: {
        groupPermissions: {
          with: {
            group: true,
          },
        },
      },
    });

    return records;
  }

  public async show(id: string) {
    const records = await this.db.query.permissions.findMany({
      where: eq(permissionsTable.id, id),
      with: {
        groupPermissions: {
          with: {
            group: true,
          },
        },
      },
    });

    if (records.length === 0) {
      throw new ResourceNotFoundError('Permission', id);
    }

    return records[0];
  }

  public async create(body: CreateBody) {
    const record = await this.db
      .insert(permissionsTable)
      .values({
        id: generateId(),
        name: body.name,
      })
      .returning();

    return record[0];
  }

  public async update(id: string, body: UpdateBody) {
    const records = await this.db
      .update(permissionsTable)
      .set({
        name: body.name,
      })
      .where(eq(permissionsTable.id, id))
      .returning();

    return records[0];
  }

  public async destroy(id: string) {
    const records = await this.db
      .delete(permissionsTable)
      .where(eq(permissionsTable.id, id))
      .returning();

    return records[0];
  }
}
