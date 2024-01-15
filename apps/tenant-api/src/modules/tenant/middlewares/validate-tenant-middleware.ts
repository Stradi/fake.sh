import { BaseError } from '@fake.sh/backend-common';
import db from '@lib/database';
import { type MiddlewareHandler } from 'hono';

export default function extractTenantMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const host = ctx.req.header('Host');
    if (!host) {
      throw new BaseError({
        code: 'NO_HOST_HEADER',
        message: 'No host header present',
        action: 'Include `host` header along with your request',
      });
    }

    const parts = host.split('.');
    if (parts.length !== 2) {
      throw new BaseError({
        code: 'INVALID_HOST_HEADER',
        message: 'Provided host header is invalid',
        action:
          'Host header must contain two parts that are seperated by dot (.)',
      });
    }

    const [tenantSlug] = parts;

    const rows = await db`SELECT * FROM projects WHERE slug = ${tenantSlug}`;

    if (rows.length === 0) {
      throw new BaseError({
        code: 'INVALID_TENANT',
        message: 'Provided tenant does not found',
        action: 'Please check your tenant slug',
      });
    }

    const [tenant] = rows;
    ctx.set('tenant', tenant);

    await next();
  };
}
