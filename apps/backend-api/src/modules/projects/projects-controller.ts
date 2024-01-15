import type { Handler } from '@fake.sh/backend-common';
import { CrudController } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, ShowQuery, UpdateBody } from './projects-dto';
import ProjectsPolicy from './projects-policy';
import ProjectsService from './projects-service';

type ApiPath<ProjectId extends boolean = false> = ProjectId extends true
  ? '/api/v1/projects/:id'
  : '/api/v1/projects';

export default class ProjectsController extends CrudController {
  private readonly service = new ProjectsService();
  private readonly policy = new ProjectsPolicy();

  protected index: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'index', ctx.get('jwtPayload'));

    const q = this.validateQuery(ctx, IndexQuery);
    const records = await this.service.index(q);

    return this.ok(ctx, {
      message: `Fetched ${records.length} projects`,
      payload: records,
    });
  };

  protected show: Handler<ApiPath<true>> = async (ctx) => {
    const q = this.validateQuery(ctx, ShowQuery);
    const record = await this.service.show(ctx.req.param('id'), q);
    await this.checkPolicy(this.policy, 'show', record, ctx.get('jwtPayload'));

    return this.ok(ctx, {
      message: `Fetched project with id ${ctx.req.param('id')}`,
      payload: record,
    });
  };

  protected create: Handler<ApiPath> = async (ctx) => {
    await this.checkPolicy(this.policy, 'create', ctx.get('jwtPayload'));

    const body = await this.validateBody(ctx, CreateBody);
    const record = await this.service.create(body, ctx.get('jwtPayload'));

    return this.created(ctx, {
      message: `Created record with id ${record.id}`,
      payload: record,
    });
  };

  protected update: Handler<ApiPath<true>> = async (ctx) => {
    const body = await this.validateBody(ctx, UpdateBody);

    const record = await this.service.show(ctx.req.param('id'), {});
    if (!record) {
      return this.notFound(ctx, {
        code: 'PROJECT_NOT_FOUND',
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
    return this.ok(ctx, {
      message: `Updated record with id ${record.id}`,
      payload: updatedRecord,
    });
  };

  protected destroy: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'), {});
    if (!record) {
      return this.notFound(ctx, {
        code: 'PROJECT_NOT_FOUND',
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
    return this.ok(ctx, {
      message: `Deleted record with id ${deletedRecord.id}`,
      payload: deletedRecord,
    });
  };
}
