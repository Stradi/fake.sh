import { generateId } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { eq } from 'drizzle-orm';
import type { CreateBody, IndexQuery, UpdateBody } from './groups-dto';
import { groupsTable } from './groups-schema';

export default class GroupsService {
  private readonly db = getDb();

  public async index(query: IndexQuery) {
    const records = await this.db.query.groups.findMany({
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
    });

    return records;
  }

  public async show(id: string) {
    const records = await this.db.query.groups.findMany({
      where: eq(groupsTable.id, id),
    });

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }

  public async create(body: CreateBody) {
    const record = await this.db
      .insert(groupsTable)
      .values({
        id: generateId(),
        name: body.name,
      })
      .returning();

    return record[0];
  }

  public async update(id: string, body: UpdateBody) {
    const records = await this.db
      .update(groupsTable)
      .set({
        name: body.name,
      })
      .where(eq(groupsTable.id, id))
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }

  public async destroy(id: string) {
    const records = await this.db
      .delete(groupsTable)
      .where(eq(groupsTable.id, id))
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }
}
