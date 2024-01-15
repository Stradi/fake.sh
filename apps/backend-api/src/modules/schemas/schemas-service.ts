import {
  BaseError,
  ResourceNotFoundError,
  generateId,
} from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import type { JwtClaims } from '@utils/jwt';
import { and, eq, sql } from 'drizzle-orm';
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
        owner: query.with_owner || undefined,
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
        owner: query.with_owner || undefined,
      },
    });

    if (records.length === 0) {
      throw new ResourceNotFoundError('Schema', schemaId);
    }

    return records[0];
  }

  public async create(
    projectId: string,
    data: CreateBody,
    accountData: JwtClaims
  ) {
    const existingVersion = await this.db.query.schemas.findMany({
      where: and(
        eq(schemasTable.project_id, projectId),
        eq(schemasTable.version, data.version)
      ),
    });

    if (existingVersion.length > 0) {
      throw new BaseError({
        code: 'VERSION_ALREADY_EXISTS',
        message: 'This project already has a schema with this version.',
        action: 'Use a different version number',
        statusCode: 400,
      });
    }

    const record = await this.db
      .insert(schemasTable)
      .values({
        id: generateId(),
        version: data.version,
        data: data.data,
        project_id: projectId,
        created_by: accountData.id,
      })
      .returning();

    await this.createSchemaTables(projectId, record[0].id, data);

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

    await this.deleteSchemaTables(records[0]);
    return records[0];
  }

  private async createSchemaTables(
    projectId: string,
    schemaId: string,
    body: CreateBody
  ) {
    const tableNamePrefix = `schema_${projectId}_${schemaId}`;

    const schema = JSON.parse(body.data);
    const resources = Object.keys(schema);

    for await (const resource of resources) {
      const tableName = `${tableNamePrefix}_${resource}`;
      const columns = Object.keys(schema[resource]);

      // TODO: Change VARCHAR(255) to the correct type. We prolly need to map the JSON Schema types to SQL types.
      await this.db.execute(
        sql.raw(`
          CREATE TABLE ${tableName} (
            ${columns.map((column) => `${column} VARCHAR(255)`).join(', ')}
          );
        `)
      );
    }
  }

  private async deleteSchemaTables(
    deletedSchema: typeof schemasTable.$inferSelect
  ) {
    const tableNamePrefix = `schema_${deletedSchema.project_id}_${deletedSchema.id}`;

    const schema = JSON.parse(deletedSchema.data);
    const resources = Object.keys(schema);

    for await (const resource of resources) {
      const tableName = `${tableNamePrefix}_${resource}`;
      await this.db.execute(
        sql.raw(`
          DROP TABLE ${tableName};
        `)
      );
    }
  }
}
