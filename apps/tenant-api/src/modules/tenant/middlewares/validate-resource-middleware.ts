import { type MiddlewareHandler } from 'hono';

export default function validateResourceMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    await next();
  };
}
