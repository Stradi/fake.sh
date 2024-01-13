import type { Handler } from '@modules/base/base-controller';
import BaseController from '@modules/base/base-controller';
import BaseError from '@utils/errors/base-error';
import type { Context } from 'hono';
import ensureValidRequestMiddleware from './ensure-valid-request-middleware';
import type { RequestInfo } from './helpers';
import { extractRequestInfo } from './helpers';
import validateResourceMiddleware from './validate-resource-middleware';
import validateVersionMiddleware from './validate-version-middleware';

export default class TenantController extends BaseController {
  public router() {
    return this._app.all(
      '*',
      ensureValidRequestMiddleware(),
      validateVersionMiddleware(),
      validateResourceMiddleware(),
      this.handleRequest
    );
  }

  private handleRequest: Handler<'*'> = (ctx) => {
    const requestInfo = extractRequestInfo(ctx.req.path);
    const method = ctx.req.method;

    switch (method) {
      case 'GET':
        if (requestInfo.identifier) {
          return this.getSingleResource(ctx, requestInfo);
        }
        return this.getAllResources(ctx, requestInfo);
      case 'POST':
        return this.createResource(ctx, requestInfo);
      case 'PUT':
      case 'PATCH':
        return this.updateResource(ctx, requestInfo);
      case 'DELETE':
        return this.deleteResource(ctx, requestInfo);
      default:
        // This shouldn't happen but just in case
        throw new BaseError({
          code: 'METHOD_NOT_RECOGNIZED',
          message: 'Method is not recognized',
          action: `Use one of the standard HTTP methods to send requests`,
        });
    }
  };

  private getSingleResource = (ctx: Context, payload: RequestInfo) => {
    return this.ok(ctx, {
      message: 'Successfully fetched the resource',
      payload: {
        id: payload.identifier,
      },
    });
  };

  private getAllResources = (ctx: Context, _payload: RequestInfo) => {
    return this.ok(ctx, {
      message: 'Successfully fetched 25 resources',
      payload: new Array(25).fill({
        some: 'thing',
      }),
    });
  };

  private createResource = (ctx: Context, _payload: RequestInfo) => {
    return this.created(ctx, {
      message: 'Successfully created a resource',
      payload: {
        some: 'thing',
      },
    });
  };

  private updateResource = (ctx: Context, payload: RequestInfo) => {
    return this.ok(ctx, {
      message: 'Successfully updated the resource',
      payload: {
        id: payload.identifier,
      },
    });
  };

  private deleteResource = (ctx: Context, payload: RequestInfo) => {
    return this.ok(ctx, {
      message: 'Successfully deleted the resource',
      payload: {
        id: payload.identifier,
      },
    });
  };
}
