import type { Handler } from './base-controller';
import BaseController from './base-controller';

export default class CrudController extends BaseController {
  constructor(protected resourceName: string) {
    super();
  }

  public router() {
    this._app = this._app
      .get(`/${this.resourceName}`, this.index)
      .get(`/${this.resourceName}/:id`, this.show)
      .post(`/${this.resourceName}`, this.create)
      .put(`/${this.resourceName}/:id`, this.update)
      .patch(`/${this.resourceName}/:id`, this.update)
      .delete(`/${this.resourceName}/:id`, this.destroy);

    return this._app;
  }

  protected index: Handler = (ctx) => {
    return this.notAllowed(ctx);
  };

  protected show: Handler<'/:id'> = (ctx) => {
    return this.notAllowed(ctx);
  };

  protected create: Handler = (ctx) => {
    return this.notAllowed(ctx);
  };

  protected update: Handler<'/:id'> = (ctx) => {
    return this.notAllowed(ctx);
  };

  protected destroy: Handler<'/:id'> = (ctx) => {
    return this.notAllowed(ctx);
  };
}
