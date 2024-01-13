import { type MiddlewareHandler } from 'hono';

export default function validateVersionMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    await next();
  };
}
