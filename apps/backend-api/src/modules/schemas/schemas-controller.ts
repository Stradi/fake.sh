import type { Handler } from '@fake.sh/backend-common';
import { CrudController, ResourceNotFoundError } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, ShowQuery, UpdateBody } from './schemas-dto';
import SchemasPolicy from './schemas-policy';
import SchemasService from './schemas-service';

type ApiPath<SchemaId extends boolean = false> = SchemaId extends true
  ? '/api/v1/projects/:projectId/schemas/:schemaId'
  : '/api/v1/projects/:projectId/schemas';

export default class SchemasController extends CrudController {
  private readonly service = new SchemasService();
  private readonly policy = new SchemasPolicy();

  public index: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'index', ctx.get('jwtPayload'));

    const q = this.validateQuery(ctx, IndexQuery);
    const records = await this.service.index(ctx.req.param('projectId'), q);

    return this.ok(ctx, {
      message: `Fetched ${
        records.length
      } schemas for project with id of ${ctx.req.param('projectId')}`,
      payload: records.map((record) => ({
        ...record,
        data: JSON.parse(record.data),
      })),
    });
  };

  public show: Handler<ApiPath<true>> = async (ctx) => {
    const q = this.validateQuery(ctx, ShowQuery);
    const record = await this.service.show(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId'),
      q
    );

    await this.checkPolicy(this.policy, 'show', record, ctx.get('jwtPayload'));

    return this.ok(ctx, {
      message: `Fetched schema with id ${ctx.req.param(
        'schemaId'
      )} for project with id ${ctx.req.param('schemaId')}`,
      payload: {
        ...record,
        data: JSON.parse(record.data),
      },
    });
  };

  public create: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'create', ctx.get('jwtPayload'));

    const body = await this.validateBody(ctx, CreateBody);
    const record = await this.service.create(
      ctx.req.param('projectId'),
      body,
      ctx.get('jwtPayload')
    );

    return this.ok(ctx, {
      message: `Created schema for project with id ${ctx.req.param(
        'projectId'
      )}`,
      payload: record,
    });
  };

  protected update: Handler<ApiPath<true>> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);

    const record = await this.service.show(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId'),
      {}
    );
    if (!record) {
      throw new ResourceNotFoundError('Schema', ctx.req.param('schemaId'));
    }

    await this.checkPolicy(
      this.policy,
      'update',
      record,
      ctx.get('jwtPayload')
    );

    const updatedRecord = await this.service.update(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId'),
      body
    );

    return this.ok(ctx, {
      message: `Updated schema with id ${ctx.req.param(
        'schemaId'
      )} for project with id ${ctx.req.param('schemaId')}`,
      payload: updatedRecord,
    });
  };

  public destroy: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId'),
      {}
    );
    if (!record) {
      throw new ResourceNotFoundError('Schema', ctx.req.param('schemaId'));
    }

    await this.checkPolicy(
      this.policy,
      'destroy',
      record,
      ctx.get('jwtPayload')
    );

    const deletedRecord = await this.service.destroy(
      ctx.req.param('projectId'),
      ctx.req.param('schemaId')
    );

    return this.ok(ctx, {
      message: `Deleted schema with id ${ctx.req.param(
        'schemaId'
      )} for project with id ${ctx.req.param('schemaId')}`,
      payload: deletedRecord,
    });
  };
}
