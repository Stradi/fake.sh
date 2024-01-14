import type { MiddlewareHandler } from 'hono';
import { log } from '../../utils/logger';

export default function loggerMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    await next();

    const { pathname, search } = new URL(ctx.req.url);
    log.info(`${ctx.req.method} ${pathname}${search} - ${ctx.res.status}`);
  };
}
