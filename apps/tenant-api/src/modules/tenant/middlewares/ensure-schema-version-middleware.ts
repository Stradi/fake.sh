import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { type MiddlewareHandler } from 'hono';
import { extractRequestInfo } from '../helpers';

export default function ensureSchemaVersionMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const { version } = extractRequestInfo(ctx.req.path);
    const versionNumber = Number(version.replace('v', ''));

    if (isNaN(versionNumber)) {
      throw new BaseError({
        code: 'INVALID_VERSION',
        message: 'Version is not a valid number',
        action: 'Make sure you are using a valid version number',
      });
    }

    const project = ctx.get('project');
    const rows = await db
      .select()
      .from('schemas')
      .where({
        project_id: project.id,
        version: versionNumber,
      })
      .limit(1);

    if (rows.length === 0) {
      throw new BaseError({
        code: 'VERSION_NOT_FOUND',
        message: 'Schema does not have the provided version',
        action:
          'Make sure the schema has the provided version number and try again',
      });
    }

    ctx.set('schemaVersion', versionNumber);
    await next();
  };
}
