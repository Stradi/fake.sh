import {
  BaseError,
  ResourceNotFoundError,
  TenantResource,
  generateId,
} from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import type { JwtClaims } from '@utils/jwt';
import { and, eq, sql } from 'drizzle-orm';
import type {
  CreateBody,
  GetLogsQuery,
  GetUsageQuery,
  IndexQuery,
  ShowQuery,
  UpdateBody,
} from './schemas-dto';
import { schemasTable } from './schemas-schema';

// TODO: Wrap sequential SQL statements in a transaction.
export default class SchemasService {
  private readonly db = getDb();

  public async index(
    projectId: string,
    query: IndexQuery,
    accountData: JwtClaims
  ) {
    const records = await this.db.query.schemas.findMany({
      where: and(
        eq(schemasTable.project_id, projectId),
        query.own ? eq(schemasTable.created_by, accountData.id) : undefined
      ),
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

  public async getLogs(
    projectId: string,
    schemaId: string,
    query: GetLogsQuery
  ) {
    const tableName = `schema_${projectId}_${schemaId}_logs`;

    const records = await this.db.execute(
      sql.raw(
        `SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT ${
          query.limit || 10
        } OFFSET ${query.page ? (query.page - 1) * (query.limit || 10) : 0};`
      )
    );

    return records;
  }

  public async getUsage(
    projectId: string,
    schemaId: string,
    query: GetUsageQuery
  ) {
    const tableName = `schema_${projectId}_${schemaId}_logs`;

    const to = new Date();
    to.setFullYear(to.getFullYear() + 1000);

    const from = new Date();

    switch (query.timeframe) {
      case 'hour':
        from.setHours(from.getHours() - 1);
        break;
      case 'day':
        from.setDate(from.getDate() - 1);
        break;
      case 'week':
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from.setMonth(from.getMonth() - 1);
        break;
      case 'millennium':
        from.setFullYear(from.getFullYear() - 1000);
        break;
      default:
        from.setHours(from.getHours() - 1);
    }

    const records = await this.db.execute(
      sql.raw(
        `SELECT COUNT(*) AS count FROM ${tableName} WHERE created_at BETWEEN '${from.toISOString()}' AND '${to.toISOString()}';`
      )
    );

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
      const tenantResource = new TenantResource({
        tableName: `${tableNamePrefix}_${resource}`,
        columns: body.data[resource].columns,
      });

      await this.db.execute(sql.raw(tenantResource.sql.createTable()));
    }

    // Logs table
    await this.db.execute(
      sql.raw(
        `CREATE TABLE ${tableNamePrefix}_logs (
          id serial PRIMARY KEY,
          url text NOT NULL,
          method text NOT NULL,
          status_code integer NOT NULL,
          body text NOT NULL,
          headers text NOT NULL,
          created_at timestamp NOT NULL DEFAULT NOW()
        );`
      )
    );
  }

  private async deleteSchemaTables(
    deletedSchema: typeof schemasTable.$inferSelect
  ) {
    const tableNamePrefix = `schema_${deletedSchema.project_id}_${deletedSchema.id}`;

    const schema = JSON.parse(deletedSchema.data);
    const resources = Object.keys(schema);

    for await (const resource of resources) {
      const tenantResource = new TenantResource({
        tableName: `${tableNamePrefix}_${resource}`,
        columns: schema[resource].columns,
      });

      await this.db.execute(sql.raw(tenantResource.sql.dropTable()));
    }
  }

  private async seedSchemaTables(
    schema: typeof schemasTable.$inferSelect,
    data: CreateBody['data']
  ) {
    const tableNamePrefix = `schema_${schema.project_id}_${schema.id}`;
    const resources = Object.keys(data);

    for await (const resource of resources) {
      const tenantResource = new TenantResource({
        tableName: `${tableNamePrefix}_${resource}`,
        columns: data[resource].columns,
      });

      const arr = Array.from({ length: data[resource].initialCount }, () =>
        tenantResource.generateRowData()
      );

      await this.db.execute(sql.raw(tenantResource.sql.insert(arr)));
    }
  }
}
