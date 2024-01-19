import { BaseError } from '@fake.sh/backend-common';
import { extractJwtPayload } from '@utils/jwt';
import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

export default function authMiddleware(require = false): MiddlewareHandler {
  return async (ctx, next) => {
    const cookie = getCookie(ctx, '__fakesh');
    if (!cookie) {
      if (require) {
        throw new BaseError({
          statusCode: 401,
          code: 'NO_COOKIE',
          message: 'No cookie found in request headers',
          action: 'Provide a valid cookie in the request headers',
        });
      } else {
        await next();
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- need any here
    let cookiePayload: any;
    try {
      cookiePayload = JSON.parse(cookie);
    } catch (e) {
      if (require) {
        throw new BaseError({
          statusCode: 401,
          code: 'INVALID_COOKIE',
          message: 'Cookie in request headers is invalid',
          action: 'Provide a valid cookie in the request headers',
        });
      } else {
        await next();
        return;
      }
    }

    const authToken = cookiePayload.token;
    if (!authToken) {
      if (require) {
        throw new BaseError({
          statusCode: 401,
          code: 'NO_AUTH_TOKEN',
          message: 'No auth token found in cookie',
          action: 'Provide a valid auth token in the cookie',
        });
      }

      await next();
      return;
    }

    const jwtPayload = await extractJwtPayload(authToken);
    ctx.set('jwtPayload', jwtPayload);

    await next();
  };
}
