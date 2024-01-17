import {
  BaseError,
  ResourceNotFoundError,
  generateId,
} from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import type { JwtClaims } from '@utils/jwt';
import { generateData, getCreateTableSql, getInsertSql } from '@utils/schema';
import { and, eq, sql } from 'drizzle-orm';
import type {
  CreateBody,
  IndexQuery,
  ShowQuery,
  UpdateBody,
} from './schemas-dto';
import { schemasTable } from './schemas-schema';

// TODO: Wrap sequential SQL statements in a transaction.
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

    // this.validateSchema(data.data);

    const record = await this.db
      .insert(schemasTable)
      .values({
        id: generateId(),
        version: data.version,
        data: JSON.stringify(data.data),
        project_id: projectId,
        created_by: accountData.id,
      })
      .returning();

    await this.createSchemaTables(projectId, record[0].id, data);
    await this.seedSchemaTables(record[0], data.data);

    return record[0];
  }

  public async update(projectId: string, schemaId: string, data: UpdateBody) {
    const records = await this.db
      .update(schemasTable)
      .set({
        version: data.version,
        // TODO: To update the schema data, we also need to update the tables.
        //       We need to figure out how to create ALTER TABLE statements from
        //       the difference between the old and new schema data. Or disable
        //       this feature :)
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

    const resources = Object.keys(body.data);

    for await (const resource of resources) {
      const tableName = `${tableNamePrefix}_${resource}`;
      const sqlStatement = getCreateTableSql(
        tableName,
        body.data[resource].columns
      );

      await this.db.execute(sql.raw(sqlStatement));
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

  private async seedSchemaTables(
    schema: typeof schemasTable.$inferSelect,
    data: CreateBody['data']
  ) {
    const tableNamePrefix = `schema_${schema.project_id}_${schema.id}`;
    const resources = Object.keys(data);

    for await (const resource of resources) {
      const tableName = `${tableNamePrefix}_${resource}`;
      const rows: { names: string; values: string }[] = [];

      for (let i = 0; i < data[resource].initialCount; i++) {
        rows.push(getInsertSql(generateData(data[resource].columns)));
      }

      const sqlStatement = `
        INSERT INTO ${tableName} (${rows[0].names})
          VALUES ${rows.map((r) => `(${r.values})`).join(', ')}
      ;`;

      await this.db.execute(sql.raw(sqlStatement));
    }
  }
}
