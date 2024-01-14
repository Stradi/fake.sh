import { generateId, slugify } from '@fake.sh/backend-common';
import { getDb } from '@lib/database';
import { eq } from 'drizzle-orm';
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
      return null;
    }

    return records[0];
  }

  public async create(body: CreateBody) {
    const record = await this.db
      .insert(projectsTable)
      .values({
        id: generateId(),
        name: body.name,
        slug: slugify(body.name),
      })
      .returning();

    return record[0];
  }

  public async update(id: string, body: UpdateBody) {
    let slug: string | undefined;
    if (body.slug) {
      slug = slugify(body.slug);
    } else if (body.name) {
      slug = slugify(body.name);
    }

    const records = await this.db
      .update(projectsTable)
      .set({
        name: body.name,
        slug,
        updated_at: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }

  public async destroy(id: string) {
    const records = await this.db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning();

    if (records.length === 0) {
      return null;
    }

    return records[0];
  }
}
