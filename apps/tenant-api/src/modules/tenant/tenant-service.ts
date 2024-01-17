import db from '@lib/database';
import type { HandlerPayload } from './tenant-controller';

export default class TenantService {
  public async index(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const records = await db`SELECT * FROM ${db(tableName)} LIMIT 10 OFFSET 0;`;
    return records.map(this.convertRow.bind(this));
  }

  public async show(payload: HandlerPayload) {
    const tableName = this.getTableName(payload);

    const records = await db`SELECT * FROM ${db(tableName)} LIMIT 1;`;
    return this.convertRow.bind(this)(records[0]);
  }

  public async create(payload: HandlerPayload) {}

  public async update(payload: HandlerPayload) {}

  public async destroy(payload: HandlerPayload) {}

  private getTableName(payload: HandlerPayload) {
    const {
      schema,
      project,
      requestInfo: { resource },
    } = payload;
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
