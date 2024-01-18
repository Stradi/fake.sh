import type { Handler } from '@fake.sh/backend-common';
import { BaseController, BaseError } from '@fake.sh/backend-common';
import type { Context } from 'hono';
import type { RequestInfo } from './helpers';
import { extractRequestInfo } from './helpers';
import ensureProjectMiddleware from './middlewares/ensure-project-middleware';
import ensureResourceMiddleware from './middlewares/ensure-resource-middleware';
import ensureSchemaVersionMiddleware from './middlewares/ensure-schema-version-middleware';
import ensureValidRequestMiddleware from './middlewares/ensure-valid-request-middleware';
import { IndexQuery } from './tenant-dto';
import TenantService from './tenant-service';

export type HandlerPayload = {
  requestInfo: RequestInfo;
  project: unknown;
  schemaVersion: number;
  schema: unknown;
};

export default class TenantController extends BaseController {
  private service = new TenantService();

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

    const handlerPayload: HandlerPayload = {
      requestInfo,
      project,
      schemaVersion,
      schema,
    };

    switch (method) {
      case 'GET':
        if (requestInfo.identifier) {
          return this.show(ctx, handlerPayload);
        }
        return this.index(ctx, handlerPayload);
      case 'POST': {
        return this.create(ctx, handlerPayload);
      }
      case 'PUT':
      case 'PATCH': {
        return this.update(ctx, handlerPayload);
      }
      case 'DELETE': {
        return this.destroy(ctx, handlerPayload);
      }
      default:
        // This shouldn't happen but just in case
        throw new BaseError({
          code: 'METHOD_NOT_RECOGNIZED',
          message: 'Method is not recognized',
          action: `Use one of the standard HTTP methods to send requests`,
        });
    }
  };

  private async index(ctx: Context, payload: HandlerPayload) {
    const q = this.validateQuery(ctx, IndexQuery);
    const resources = await this.service.index(payload, q);

    return this.ok(ctx, {
      message: `Successfully fetched ${resources.length} resources`,
      payload: resources,
    });
  }

  private async show(ctx: Context, payload: HandlerPayload) {
    const resource = await this.service.show(payload);

    return this.ok(ctx, {
      message: 'Successfully fetched the resource',
      payload: resource,
    });
  }

  private async create(ctx: Context, payload: HandlerPayload) {
    const tableDescription = await this.service.getTableDescription(payload);
    const body = await this.validateBody(
      ctx,
      this.service.getZodSchema(
        tableDescription.map((row) => ({
          ...row,
          isOptional: false,
        }))
      )
    );

    const record = await this.service.create(payload, body);

    return this.created(ctx, {
      message: 'Successfully created the resource',
      payload: record,
    });
  }

  private async update(ctx: Context, payload: HandlerPayload) {
    const tableDescription = await this.service.getTableDescription(payload);
    const body = await this.validateBody(
      ctx,
      this.service.getZodSchema(
        tableDescription.map((row) => ({
          ...row,
          isOptional: true,
        }))
      )
    );

    if (Object.keys(body).length === 0) {
      return this.ok(ctx, {
        message: 'No changes were made',
        payload: {},
      });
    }

    const record = await this.service.update(payload, body);

    return this.ok(ctx, {
      message: 'Successfully updated the resource',
      payload: record,
    });
  }

  private async destroy(ctx: Context, payload: HandlerPayload) {
    const record = await this.service.destroy(payload);

    return this.ok(ctx, {
      message: 'Successfully deleted the resource',
      payload: record,
    });
  }
}
