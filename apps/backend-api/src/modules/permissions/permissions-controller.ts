import type { Handler } from '@fake.sh/backend-common';
import { CrudController, ResourceNotFoundError } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, UpdateBody } from './permissions-dto';
import PermissionsPolicy from './permissions-policy';
import PermissionsService from './permissions-service';

type ApiPath<PermissionId extends boolean = false> = PermissionId extends true
  ? '/api/v1/permissions/:id'
  : '/api/v1/permissions';

export default class PermissionsController extends CrudController {
  private readonly service = new PermissionsService();
  private readonly policy = new PermissionsPolicy();

  protected index: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'index', ctx.get('jwtPayload'));

    const q = this.validateQuery(ctx, IndexQuery);
    const records = await this.service.index(q);

    return this.ok(ctx, {
      message: `Fetched ${records.length} records`,
      payload: records,
    });
  };

  protected show: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      throw new ResourceNotFoundError('Permission', ctx.req.param('id'));
    }

    await this.checkPolicy(this.policy, 'show', record, ctx.get('jwtPayload'));

    return this.ok(ctx, {
      message: `Fetched record with id ${ctx.req.param('id')}`,
      payload: record,
    });
  };

  protected create: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'create', ctx.get('jwtPayload'));

    const body = await this.validateBody(ctx, CreateBody);
    const record = await this.service.create(body);

    return this.created(ctx, {
      message: `Created record with id ${record.id}`,
      payload: record,
    });
  };

  protected update: Handler<ApiPath<true>> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);

    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      throw new ResourceNotFoundError('Permission', ctx.req.param('id'));
    }

    await this.checkPolicy(
      this.policy,
      'update',
      record,
      ctx.get('jwtPayload')
    );

    const updatedRecord = await this.service.update(ctx.req.param('id'), body);
    return this.ok(ctx, {
      message: `Updated record with id ${updatedRecord.id}`,
      payload: updatedRecord,
    });
  };

  protected delete: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      throw new ResourceNotFoundError('Permission', ctx.req.param('id'));
    }

    await this.checkPolicy(
      this.policy,
      'destroy',
      record,
      ctx.get('jwtPayload')
    );

    const deletedRecord = await this.service.destroy(ctx.req.param('id'));
    return this.ok(ctx, {
      message: `Deleted record with id ${deletedRecord.id}`,
      payload: deletedRecord,
    });
  };
}
