import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { z } from 'zod';
import type { HandlerPayload } from './tenant-controller';
import type { IndexQuery } from './tenant-dto';

export default class TenantService {
  public async index(payload: HandlerPayload, q: IndexQuery) {
    const tableName = this.getTableName(payload);
    const limit = q.limit || 10;
    const offset = q.page ? (q.page - 1) * limit : 0;

    const records = await db
      .select()
      .from(tableName)
      .offset(offset)
      .limit(limit);

    return records.map(this.convertRow.bind(this));
  }

  public async show(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const records = await db.select().from(tableName).limit(1);
    return this.convertRow.bind(this)(records[0]);
  }

  public async create(
    payload: HandlerPayload,
    data: Record<string, string | number | boolean>
  ) {
    const tableName = this.getTableName(payload);

    const record = await db.insert(data).into(tableName).returning('*');
    return record[0];
  }

  public async update(
    payload: HandlerPayload,
    data: Record<string, string | number | boolean>
  ) {
    const tableName = this.getTableName(payload);

    const record = await db.update(data).from(tableName).returning('*');
    return record[0];
  }

  public async destroy(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const record = await db.delete().from(tableName).returning('*');
    return record[0];
  }

  public async getTableDescription(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const description = await db
      .select('column_name', 'data_type')
      .from('information_schema.columns')
      .where('table_name', tableName);

    return description.map((row) => ({
      name: row.column_name as string,
      type: row.data_type as string,
    }));
  }

  public getZodSchema(
    schema: { name: string; type: string; isOptional?: boolean }[]
  ): z.ZodObject<Record<string, z.ZodType>> {
    const obj: Record<string, z.ZodType> = {};
    schema.forEach((row) => {
      obj[row.name] = this.columnTypeToZodType(
        row.type,
        row.isOptional || false
      );
    });
    return z.object(obj);
  }

  private columnTypeToZodType(type: string, isOptional: boolean): z.ZodType {
    const mapping = {
      text: z.string(),
      integer: z.coerce.number(),
      boolean: z.coerce.boolean(),
    };

    if (isOptional) {
      return mapping[type as keyof typeof mapping].optional();
    }

    if (!['text', 'integer', 'boolean'].includes(type)) {
      throw new BaseError({
        code: 'TYPE_NOT_SUPPORTED',
        message: 'Type is not supported',
        action: `Use one of the supported types`,
      });
    }

    return mapping[type as keyof typeof mapping];
  }

  private getTableName(payload: HandlerPayload) {
    const {
      schema,
      project,
      requestInfo: { resource },
    } = payload;
    // @ts-expect-error -- will add types later
    return `schema_${project.id}_${schema.id}_${resource}`;
  }

  private convertRow(row: Record<string, unknown>) {
    return Object.entries(row).reduce((acc, [key, value]) => {
      if (typeof value !== 'string')
        return {
          ...acc,
          [key]: value,
        };
      return {
        ...acc,
        [key]: this.tryConvertJson(value),
      };
    }, {});
  }

  private tryConvertJson(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (isNaN(parsed)) return parsed;
      return data;
    } catch {
      return data;
    }
  }
}
