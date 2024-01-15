import type { Handler } from '@fake.sh/backend-common';
import { BaseError, CrudController } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, UpdateBody } from './groups-dto';
import GroupsPolicy from './groups-policy';
import GroupsService from './groups-service';

type ApiPath<GroupId extends boolean = false> = GroupId extends true
  ? '/api/v1/groups/:id'
  : '/api/v1/groups';

export default class GroupsController extends CrudController {
  private readonly service = new GroupsService();
  private readonly policy = new GroupsPolicy();

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
      return this.notFound(ctx, {
        code: 'GROUP_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
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
      return this.notFound(ctx, {
        code: 'GROUP_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    await this.checkPolicy(
      this.policy,
      'update',
      record,
      ctx.get('jwtPayload')
    );

    const updatedRecord = await this.service.update(ctx.req.param('id'), body);
    if (!updatedRecord) {
      throw new BaseError({
        code: 'GROUP_UPDATE_FAILED',
        message: `Failed to update record with id ${ctx.req.param('id')}`,
        action: 'Please try again later',
        additionalData: {
          record,
          body,
        },
      });
    }

    return this.ok(ctx, {
      message: `Updated record with id ${record.id}`,
      payload: record,
    });
  };

  protected delete: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      return this.notFound(ctx, {
        code: 'GROUP_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    await this.checkPolicy(
      this.policy,
      'destroy',
      record,
      ctx.get('jwtPayload')
    );

    const deletedRecord = await this.service.destroy(ctx.req.param('id'));
    if (!deletedRecord) {
      throw new BaseError({
        code: 'GROUP_DELETE_FAILED',
        message: `Failed to delete record with id ${ctx.req.param('id')}`,
        action: 'Please try again later',
        additionalData: {
          record,
        },
      });
    }

    return this.ok(ctx, {
      message: `Deleted record with id ${record.id}`,
      payload: record,
    });
  };
}
