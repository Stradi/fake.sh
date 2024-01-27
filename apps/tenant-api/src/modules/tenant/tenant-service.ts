import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { getRequestBodySafe, getRequestHeadersSafe } from '@utils/request';
import type { Context } from 'hono';
import { z } from 'zod';
import type { HandlerPayload } from './tenant-controller';
import type { IndexQuery } from './tenant-dto';

export default class TenantService {
  public async index(_ctx: Context, payload: HandlerPayload, q: IndexQuery) {
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

  public async show(ctx: Context, payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const record = await db.select('*').from(tableName).where({
      __id: payload.requestInfo.identifier,
    });

    // TODO: Maybe handle error cases in error middleware??
    if (record.length === 0) {
      await this.insertLogImpl(
        // @ts-expect-error -- will add types later
        `schema_${payload.project.id}_${payload.schema.id}_logs`,
        {
          url: ctx.req.url,
          method: ctx.req.method,
          status_code: 404,
          body: await getRequestBodySafe(ctx.req.raw),
          headers: getRequestHeadersSafe(ctx.req.raw),
        }
      );

      throw new BaseError({
        code: 'NOT_FOUND',
        message: `Record not found`,
        action: `The record with id ${payload.requestInfo.identifier} was not found`,
        statusCode: 404,
      });
    }

    return this.convertRow.bind(this)(record[0]);
  }

  public async create(
    _ctx: Context,
    payload: HandlerPayload,
    data: Record<string, string | number | boolean>
  ) {
    const tableName = this.getTableName(payload);

    const record = await db.insert(data).into(tableName).returning('*');
    return record[0];
  }

  public async update(
    _ctx: Context,
    payload: HandlerPayload,
    data: Record<string, string | number | boolean>
  ) {
    const tableName = this.getTableName(payload);

    const record = await db
      .update(data)
      .from(tableName)
      .where({
        __id: payload.requestInfo.identifier,
      })
      .returning('*');
    return record[0];
  }

  public async destroy(ctx: Context, payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const record = await db
      .delete()
      .from(tableName)
      .where({
        __id: payload.requestInfo.identifier,
      })
      .returning('*');

    if (record.length === 0) {
      await this.insertLogImpl(
        // @ts-expect-error -- will add types later
        `schema_${payload.project.id}_${payload.schema.id}_logs`,
        {
          url: ctx.req.url,
          method: ctx.req.method,
          status_code: 404,
          body: await getRequestBodySafe(ctx.req.raw),
          headers: getRequestHeadersSafe(ctx.req.raw),
        }
      );

      throw new BaseError({
        code: 'NOT_FOUND',
        message: `Record not found`,
        action: `The record with id ${payload.requestInfo.identifier} was not found`,
        statusCode: 404,
      });
    }

    return record[0];
  }

  public async insertLog(
    ctx: Context,
    response: Response,
    payload: HandlerPayload
  ) {
    // @ts-expect-error -- will add types later
    const tableName = `schema_${payload.project.id}_${payload.schema.id}_logs`;

    await this.insertLogImpl(tableName, {
      url: ctx.req.url,
      method: ctx.req.method,
      status_code: response.status,
      body: await getRequestBodySafe(ctx.req.raw),
      headers: getRequestHeadersSafe(ctx.req.raw),
    });
  }

  public async getTableDescription(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const description = await db
      .select('column_name', 'data_type')
      .from('information_schema.columns')
      .where('table_name', tableName);

    return description
      .map((row) => ({
        name: row.column_name as string,
        type: row.data_type as string,
      }))
      .filter((row) => row.name !== '__id');
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

  private insertLogImpl(
    tableName: string,
    data: {
      url: string;
      method: string;
      status_code: number;
      body: unknown;
      headers: Record<string, string>;
    }
  ) {
    return db
      .insert({
        ...data,
        body: JSON.stringify(data.body),
        headers: JSON.stringify(data.headers),
        created_at: new Date(),
      })
      .into(tableName);
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
      if (key === '__id') {
        return {
          ...acc,
          id: value,
        };
      }

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
