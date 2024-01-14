import type { Handler } from './base-controller';
import BaseController from './base-controller';

type Options = {
  resourceName: string;
  handlerParamName?: string;
};

export default class CrudController extends BaseController {
  protected readonly resourceName: string;
  protected readonly handlerParamName: string;

  constructor(options: Options) {
    super();

    const { resourceName, handlerParamName = 'id' } = options;
    this.resourceName = resourceName;
    this.handlerParamName = handlerParamName;
  }

  public router() {
    this._app = this._app
      .get(`/${this.resourceName}`, this.index)
      .get(`/${this.resourceName}/:${this.handlerParamName}`, this.show)
      .post(`/${this.resourceName}`, this.create)
      .put(`/${this.resourceName}/:${this.handlerParamName}`, this.update)
      .patch(`/${this.resourceName}/:${this.handlerParamName}`, this.update)
      .delete(`/${this.resourceName}/:${this.handlerParamName}`, this.destroy);

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
