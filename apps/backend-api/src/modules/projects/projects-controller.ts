import type { Handler } from '@fake.sh/backend-common';
import { BaseError, CrudController } from '@fake.sh/backend-common';
import { CreateBody, IndexQuery, UpdateBody } from './projects-dto';
import ProjectsService from './projects-service';

type ApiPath<ProjectId extends boolean = false> = ProjectId extends true
  ? '/api/v1/projects/:id'
  : '/api/v1/projects';

// TODO: Check errors and null results from service methods and return appropriate responses
export default class ProjectsController extends CrudController {
  private readonly service = new ProjectsService();

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

  protected create: Handler<ApiPath> = async (ctx) => {
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
        code: 'PROJECT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    const updatedRecord = await this.service.update(ctx.req.param('id'), body);
    if (!updatedRecord) {
      throw new BaseError({
        code: 'PROJECT_UPDATE_FAILED',
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

  protected destroy: Handler<ApiPath<true>> = async (ctx) => {
    const record = await this.service.show(ctx.req.param('id'));
    if (!record) {
      return this.notFound(ctx, {
        code: 'PROJECT_NOT_FOUND',
        message: `Record with id ${ctx.req.param('id')} not found`,
        action: 'Please check the id and try again',
      });
    }

    const deletedRecord = await this.service.destroy(ctx.req.param('id'));
    if (!deletedRecord) {
      throw new BaseError({
        code: 'PROJECT_DELETE_FAILED',
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
