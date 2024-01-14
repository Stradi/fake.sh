import type { Handler } from '@fake.sh/backend-common';
import { BaseError, CrudController } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery } from './schemas-dto';
import SchemasService from './schemas-service';

type ApiPath<SchemaId extends boolean = false> = SchemaId extends true
  ? '/api/v1/projects/:projectId/schemas/:schemaId'
  : '/api/v1/projects/:projectId/schemas';

export default class SchemasController extends CrudController {
  private readonly service = new SchemasService();

  public index: Handler<ApiPath> = async (ctx) => {
    const q = this.validateQuery(ctx, IndexQuery);
    const records = await this.service.index(ctx.req.param('projectId'), q);

    return this.ok(ctx, {
      message: `Fetched ${
        records.length
      } schemas for project with id of ${ctx.req.param('projectId')}`,
      payload: records,
    });
  };

  public show: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId')
    );
    if (!record) {
      return this.notFound(ctx, {
        code: 'SCHEMA_NOT_FOUND',
        message: `Schema with id ${ctx.req.param(
          'schemaId'
        )} not found for project with id ${ctx.req.param('schemaId')}`,
        action: 'Please check the id and try again',
      });
    }

    return this.ok(ctx, {
      message: `Fetched schema with id ${ctx.req.param(
        'schemaId'
      )} for project with id ${ctx.req.param('schemaId')}`,
      payload: record,
    });
  };

  public create: Handler<ApiPath> = async (ctx) => {
    const body = await this.validateBody(ctx, CreateBody);
    const record = await this.service.create(ctx.req.param('projectId'), body);

    return this.ok(ctx, {
      message: `Created schema for project with id ${ctx.req.param(
        'projectId'
      )}`,
      payload: record,
    });
  };

  public destroy: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId')
    );
    if (!record) {
      return this.notFound(ctx, {
        code: 'SCHEMA_NOT_FOUND',
        message: `Schema with id ${ctx.req.param(
          'schemaId'
        )} not found for project with id ${ctx.req.param('schemaId')}`,
        action: 'Please check the id and try again',
      });
    }

    const deletedRecord = await this.service.destroy(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId')
    );
    if (!deletedRecord) {
      throw new BaseError({
        code: 'SCHEMA_DELETE_FAILED',
        message: `Failed to delete schema with id ${ctx.req.param(
          'schemaId'
        )} for project with id ${ctx.req.param('schemaId')}`,
        action: 'Please try again later',
        additionalData: {
          record,
        },
      });
    }

    return this.ok(ctx, {
      message: `Deleted schema with id ${ctx.req.param(
        'schemaId'
      )} for project with id ${ctx.req.param('schemaId')}`,
      payload: deletedRecord,
    });
  };
}
