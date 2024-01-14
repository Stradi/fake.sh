import type { Handler } from '@fake.sh/backend-common';
import { CrudController } from '@fake.sh/backend-common';
import { IndexQuery, UpdateBody } from './accounts-dto';
import AccountsService from './accounts-service';

type ApiPath<AccountId extends boolean = false> = AccountId extends true
  ? '/api/v1/accounts/:id'
  : '/api/v1/accounts';

export class AccountsController extends CrudController {
  private readonly service = new AccountsService();

  protected index: Handler<ApiPath> = async (ctx) => {
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
        code: 'ACCOUNT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    return this.ok(ctx, {
      message: `Fetched record with id ${ctx.req.param('id')}`,
      payload: record,
    });
  };

  protected update: Handler<ApiPath<true>> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);

    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      return this.notFound(ctx, {
        code: 'ACCOUNT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    const updatedRecord = await this.service.update(ctx.req.param('id'), body);

    return this.ok(ctx, {
      message: `Updated record with id ${ctx.req.param('id')}`,
      payload: updatedRecord,
    });
  };

  delete: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      return this.notFound(ctx, {
        code: 'ACCOUNT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    const deletedRecord = await this.service.destroy(ctx.req.param('id'));

    return this.ok(ctx, {
      message: `Deleted record with id ${ctx.req.param('id')}`,
      payload: deletedRecord,
    });
  };
}
