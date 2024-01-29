/* eslint-disable import/no-named-as-default-member -- weird, prolly a bug in Bun */
import {
  ResourceNotFoundError,
  generateId,
  slugify,
} from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { schemasTable } from '@modules/schemas/schemas-schema';
import SchemasService from '@modules/schemas/schemas-service';
import type { JwtClaims } from '@utils/jwt';
import { eq, or } from 'drizzle-orm';
import pg from 'postgres';
import type {
  CreateBody,
  GetUsageQuery,
  IndexQuery,
  ShowQuery,
  UpdateBody,
} from './projects-dto';
import { projectsTable } from './projects-schema';

export default class ProjectsService {
  private readonly db = getDb();

  public async index(query: IndexQuery, accountData: JwtClaims) {
    const records = await this.db.query.projects.findMany({
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
      with: {
        schemas: query.with_schemas || undefined,
        owner: query.with_owner || undefined,
      },
      where: query.own
        ? eq(projectsTable.created_by, accountData.id)
        : undefined,
    });

    if (query.with_usage) {
      const newRecords = [];
      for await (const record of records) {
        // @ts-expect-error -- (GetUsageQuery + some extra fields) is basically the same as ShowQuery
        const usage = await this.getUsage(record.id, query);
        newRecords.push({
          ...record,
          usage,
        });
      }

      return newRecords;
    }

    return records;
  }

  public async show(id: string, query: ShowQuery) {
    const records = await this.db.query.projects.findMany({
      where: or(eq(projectsTable.id, id), eq(projectsTable.slug, id)),
      with: {
        schemas: query.with_schemas || undefined,
        owner: query.with_owner || undefined,
      },
    });

    if (records.length === 0) {
      throw new ResourceNotFoundError('Project', id);
    }

    if (query.with_usage) {
      // @ts-expect-error -- (GetUsageQuery + some extra fields) is basically the same as ShowQuery
      const usage = await this.getUsage(records[0].id, query);
      return {
        ...records[0],
        usage,
      };
    }

    return records[0];
  }

  public async create(
    body: CreateBody,
    accountData: JwtClaims,
    addSlug = false
  ): Promise<typeof projectsTable.$inferInsert> {
    try {
      const record = await this.db
        .insert(projectsTable)
        .values({
          id: generateId(),
          name: body.name,
          slug: slugify(body.name, addSlug ? 5 : 0),
          created_by: accountData.id,
        })
        .returning();

      return record[0];
    } catch (error) {
      if (error instanceof pg.PostgresError) {
        if (error.code === '23505') {
          // If we have unique constraint error, we will add id to slug and try again
          return this.create(body, accountData, true);
        }
      }

      throw error;
    }
  }

  public async update(
    id: string,
    body: UpdateBody,
    addSlug = false
  ): Promise<typeof projectsTable.$inferInsert> {
    let slug: string | undefined;
    if (body.name) {
      slug = slugify(body.name, addSlug ? 5 : 0);
    }

    if (body.slug) {
      slug = slugify(body.slug, addSlug ? 5 : 0);
    }

    try {
      const records = await this.db
        .update(projectsTable)
        .set({
          name: body.name,
          slug,
          updated_at: new Date(),
        })
        .where(eq(projectsTable.id, id))
        .returning();

      return records[0];
    } catch (error) {
      if (error instanceof pg.PostgresError) {
        if (error.code === '23505') {
          // If we have unique constraint error, we will add id to slug and try again
          return this.update(id, body, true);
        }
      }

      throw error;
    }
  }

  public async destroy(id: string) {
    const records = await this.db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning();

    return records[0];
  }

  public async getUsage(id: string, query: GetUsageQuery) {
    // Get all schemas and sum their usage.
    const schemaService = new SchemasService();

    const schemas = await this.db.query.schemas.findMany({
      where: eq(schemasTable.project_id, id),
      columns: {
        id: true,
      },
    });

    const schemaIds = schemas.map((s) => s.id);
    const usageArr: number[] = [];

    for await (const schemaId of schemaIds) {
      const usage = await schemaService.getUsage(id, schemaId, query);
      usageArr.push(Number(usage.count));
    }

    return usageArr.reduce((a, b) => a + b, 0);
  }
}
