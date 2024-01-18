import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { type MiddlewareHandler } from 'hono';
import { extractRequestInfo } from '../helpers';

export default function ensureResourceMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const project = ctx.get('project');
    const schemaVersion = ctx.get('schemaVersion');

    //`SELECT * FROM schemas WHERE project_id = ${project.id} AND version = ${schemaVersion} LIMIT 1`;
    const rows = await db
      .select()
      .from('schemas')
      .where({
        project_id: project.id,
        version: schemaVersion,
      })
      .limit(1);
    const schema = rows[0];

    let parsedSchema: null | object = null;
    try {
      parsedSchema = JSON.parse(schema.data);
    } catch {
      throw new BaseError({
        code: 'INVALID_SCHEMA',
        message: 'Provided schema is not valid JSON',
        action: 'Update your schema to be a valid JSON and try again',
      });
    }

    if (!parsedSchema) {
      throw new BaseError({
        code: 'INVALID_SCHEMA',
        message: 'Provided schema is not valid JSON',
        action: 'Update your schema to be a valid JSON and try again',
      });
    }

    const resources = Object.keys(parsedSchema);
    const { resource } = extractRequestInfo(ctx.req.path);

    if (!resources.includes(resource)) {
      throw new BaseError({
        code: 'INVALID_RESOURCE',
        message: 'Provided resource does not exists in schema',
        action: 'Make sure you are using a valid resource name',
      });
    }

    ctx.set('schema', {
      ...schema,
      data: parsedSchema,
    });
    await next();
  };
}
