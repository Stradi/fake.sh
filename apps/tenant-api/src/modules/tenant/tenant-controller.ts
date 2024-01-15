import type { Handler } from '@fake.sh/backend-common';
import { BaseController, BaseError } from '@fake.sh/backend-common';
import type { Context } from 'hono';
import type { RequestInfo } from './helpers';
import { extractRequestInfo } from './helpers';
import ensureProjectMiddleware from './middlewares/ensure-project-middleware';
import ensureResourceMiddleware from './middlewares/ensure-resource-middleware';
import ensureSchemaVersionMiddleware from './middlewares/ensure-schema-version-middleware';
import ensureValidRequestMiddleware from './middlewares/ensure-valid-request-middleware';

export default class TenantController extends BaseController {
  public router() {
    return this._app.all(
      '*',
      ensureProjectMiddleware(),
      ensureValidRequestMiddleware(),
      ensureSchemaVersionMiddleware(),
      ensureResourceMiddleware(),
      this.handleRequest
    );
  }

  private handleRequest: Handler<'*'> = (ctx) => {
    const requestInfo = extractRequestInfo(ctx.req.path);
    const method = ctx.req.method;

    const project = ctx.get('project' as never);
    const schemaVersion = ctx.get('schemaVersion' as never);
    const schema = ctx.get('schema' as never);

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

  private getSingleResource = async (ctx: Context, payload: RequestInfo) => {
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
