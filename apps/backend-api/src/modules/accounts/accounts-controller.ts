import type { Handler } from '@fake.sh/backend-common';
import { CrudController, ResourceNotFoundError } from '@fake.sh/backend-common';
import { IndexQuery, UpdateBody } from './accounts-dto';
import AccountsPolicy from './accounts-policy';
import AccountsService from './accounts-service';

type ApiPath<AccountId extends boolean = false> = AccountId extends true
  ? '/api/v1/accounts/:id'
  : '/api/v1/accounts';

export class AccountsController extends CrudController {
  private readonly service = new AccountsService();
  private readonly policy = new AccountsPolicy();

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

    await this.checkPolicy(this.policy, 'show', record, ctx.get('jwtPayload'));

    return this.ok(ctx, {
      message: `Fetched record with id ${ctx.req.param('id')}`,
      payload: record,
    });
  };

  protected update: Handler<ApiPath<true>> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);

    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      throw new ResourceNotFoundError('Account', ctx.req.param('id'));
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

  delete: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      throw new ResourceNotFoundError('Account', ctx.req.param('id'));
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
