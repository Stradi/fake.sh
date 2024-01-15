import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { type MiddlewareHandler } from 'hono';
import { extractRequestInfo } from '../helpers';

export default function validateVersionMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const { version } = extractRequestInfo(ctx.req.path);
    const versionNumber = Number(version.replace('v', ''));

    if (isNaN(versionNumber)) {
      throw new BaseError({
        code: 'INVALID_VERSION',
        message: 'Version is not a valid number',
        action: 'Provide a valid version number',
      });
    }

    const rows = await db`SELECT id FROM schemas WHERE project_id = ${
      ctx.get('tenant').id
    } AND version = ${versionNumber}`;

    if (rows.length === 0) {
      throw new BaseError({
        code: 'INVALID_VERSION',
        message: 'Provided version does not found',
        action: 'Please check your version',
      });
    }

    ctx.set('schemaVersion', versionNumber);
    await next();
  };
}
