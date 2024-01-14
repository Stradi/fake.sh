import type { Handler } from '@fake.sh/backend-common';
import { BaseController, BaseError } from '@fake.sh/backend-common';
import type { Context } from 'hono';
import type { RequestInfo } from './helpers';
import { extractRequestInfo } from './helpers';
import ensureValidRequestMiddleware from './middlewares/ensure-valid-request-middleware';
import validateResourceMiddleware from './middlewares/validate-resource-middleware';
import validateTenantMiddleware from './middlewares/validate-tenant-middleware';
import validateVersionMiddleware from './middlewares/validate-version-middleware';

export default class TenantController extends BaseController {
  public router() {
    return this._app.all(
      '*',
      validateTenantMiddleware(),
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
        tenant: ctx.get('tenant'),
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
