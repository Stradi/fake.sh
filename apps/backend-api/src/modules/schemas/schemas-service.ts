import { generateId } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { and, eq } from 'drizzle-orm';
import type {
  CreateBody,
  IndexQuery,
  ShowQuery,
  UpdateBody,
} from './schemas-dto';
import { schemasTable } from './schemas-schema';

export default class SchemasService {
  private readonly db = getDb();

  public async index(projectId: string, query: IndexQuery) {
    const records = await this.db.query.schemas.findMany({
      where: eq(schemasTable.project_id, projectId),
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
      with: {
        project: query.with_project || undefined,
      },
    });

    return records;
  }

  public async show(projectId: string, schemaId: string, query: ShowQuery) {
    const records = await this.db.query.schemas.findMany({
      where: and(
        eq(schemasTable.project_id, projectId),
        eq(schemasTable.id, schemaId)
      ),
      with: {
        project: query.with_project || undefined,
      },
    });

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }

  public async create(projectId: string, data: CreateBody) {
    const record = await this.db
      .insert(schemasTable)
      .values({
        id: generateId(),
        version: data.version,
        data: data.data,
        project_id: projectId,
      })
      .returning();

    return record[0];
  }

  public async update(projectId: string, schemaId: string, data: UpdateBody) {
    const records = await this.db
      .update(schemasTable)
      .set({
        version: data.version,
        data: data.data,
      })
      .where(
        and(
          eq(schemasTable.project_id, projectId),
          eq(schemasTable.id, schemaId)
        )
      )
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }

  public async destroy(projectId: string, schemaId: string) {
    const records = await this.db
      .delete(schemasTable)
      .where(
        and(
          eq(schemasTable.project_id, projectId),
          eq(schemasTable.id, schemaId)
        )
      )
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }
}
