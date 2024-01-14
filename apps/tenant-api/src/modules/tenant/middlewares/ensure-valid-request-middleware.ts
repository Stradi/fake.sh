import { BaseError } from '@fake.sh/backend-common';
import { type MiddlewareHandler } from 'hono';
import { extractRequestInfo } from '../helpers';

const Methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const MethodsRequiresIdentifier = ['PUT', 'PATCH', 'DELETE'];
const MethodsWithoutIdentifier = ['POST'];

export default function ensureValidRequestMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const requestInfo = extractRequestInfo(ctx.req.path);
    const infoLength = Object.values(requestInfo).filter(Boolean).length;

    const method = ctx.req.method.toUpperCase() as (typeof Methods)[number];

    if (method === 'GET' && infoLength > 3) {
      throw new BaseError({
        code: 'PASSED_ADDITIONAL_PARAMS',
        message: `Request has additional params`,
        action: `Remove the additional parameters after the identifier at the end of the request URL`,
        statusCode: 400,
      });
    }

    if (MethodsRequiresIdentifier.includes(method)) {
      if (!requestInfo.identifier) {
        throw new BaseError({
          code: 'INCOMPLETE_REQUEST',
          message: `${method} requires an identifier`,
          action: `${method} requests requires an identifier. Include an identifier at the end of the request URL`,
          statusCode: 400,
        });
      } else if (infoLength > 3) {
        throw new BaseError({
          code: 'PASSED_ADDITIONAL_PARAMS',
          message: `Request has additional params`,
          action: `Remove the additional parameters after the identifier at the end of the request URL`,
          statusCode: 400,
        });
      }
    }

    if (MethodsWithoutIdentifier.includes(method) && requestInfo.identifier) {
      throw new BaseError({
        code: 'INCOMPLETE_REQUEST',
        message: `${method} doesn't require an identifier`,
        action: `${method} requests doesnt require an identifier. Remove the identifier at the end of the request URL`,
        statusCode: 400,
      });
    }

    await next();
  };
}
