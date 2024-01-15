/* eslint-disable import/no-named-as-default-member -- weird, prolly a bug in Bun */
import { BaseError, generateId, slugify } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { eq } from 'drizzle-orm';
import pg from 'postgres';
import type {
  CreateBody,
  IndexQuery,
  ShowQuery,
  UpdateBody,
} from './projects-dto';
import { projectsTable } from './projects-schema';

export default class ProjectsService {
  private readonly db = getDb();

  public async index(query: IndexQuery) {
    const records = await this.db.query.projects.findMany({
      limit: query.limit || 10,
      offset: query.page ? (query.page - 1) * (query.limit || 10) : 0,
      with: {
        schemas: query.with_schemas || undefined,
      },
    });

    return records;
  }

  public async show(id: string, query: ShowQuery) {
    const records = await this.db.query.projects.findMany({
      where: eq(projectsTable.id, id),
      with: {
        schemas: query.with_schemas || undefined,
      },
    });

    if (records.length === 0) {
      throw new BaseError({
        statusCode: 404,
        code: 'PROJECT_NOT_FOUND',
        message: `Project with id ${id} could not found`,
        action: 'Please check the id and try again',
      });
    }

    return records[0];
  }

  public async create(
    body: CreateBody,
    addSlug = false
  ): Promise<typeof projectsTable.$inferInsert> {
    try {
      const record = await this.db
        .insert(projectsTable)
        .values({
          id: generateId(),
          name: body.name,
          slug: slugify(body.name, addSlug ? 5 : 0),
        })
        .returning();

      return record[0];
    } catch (error) {
      if (error instanceof pg.PostgresError) {
        if (error.code === '23505') {
          // If we have unique constraint error, we will add id to slug and try again
          return this.create(body, true);
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
    } else if (body.slug) {
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
}
