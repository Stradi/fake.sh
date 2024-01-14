import type { Handler } from '@fake.sh/backend-common';
import { CrudController } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, UpdateBody } from './projects-dto';
import ProjectsService from './projects-service';

// TODO: Check errors and null results from service methods and return appropriate responses
export default class ProjectsController extends CrudController {
  private readonly service = new ProjectsService();

  protected index: Handler = async (ctx) => {
    const q = this.validateQuery(ctx, IndexQuery);
    const records = await this.service.index(q);

    return this.ok(ctx, {
      message: `Fetched ${records.length} records`,
      payload: records,
    });
  };

  protected show: Handler<'/:id'> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      return this.notFound(ctx, {
        code: 'PROJECT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    return this.ok(ctx, {
      message: `Fetched record with id ${ctx.req.param('id')}`,
      payload: record,
    });
  };

  protected create: Handler = async (ctx) => {
    const body = await this.validateBody(ctx, CreateBody);
    const record = await this.service.create(body);

    return this.created(ctx, {
      message: `Created record with id ${record.id}`,
      payload: record,
    });
  };

  protected update: Handler<'/:id'> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);
    const record = await this.service.update(ctx.req.param('id'), body);

    return this.ok(ctx, {
      message: `Updated record with id ${record.id}`,
      payload: record,
    });
  };

  protected destroy: Handler<'/:id'> = async (ctx) => {
    const record = await this.service.destroy(ctx.req.param('id'));

    return this.ok(ctx, {
      message: `Deleted record with id ${record.id}`,
      payload: record,
    });
  };
}
