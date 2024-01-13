import type { ErrorResponseData, SuccessResponseData } from '@utils/response';
import { resp } from '@utils/response';
import type { Context, Env, Next } from 'hono';
import { Hono } from 'hono';

type ResponseType = Response | Promise<Response>;

export type Handler<Path extends string = '/'> = (
  ctx: Context<Env, Path>,
  next?: Next
) => ResponseType;

export default class BaseController {
  _app = new Hono();

  public router(): Hono {
    throw new Error(`Router is not implemented for ${this.constructor.name}`);
  }

  public ok(ctx: Context, additionalData?: SuccessResponseData): ResponseType {
    const obj = resp({
      message: additionalData?.message ?? 'OK',
      payload: additionalData?.payload || null,
    });

    ctx.status(200);
    return ctx.json(obj);
  }

  public created(
    ctx: Context,
    additionalData?: SuccessResponseData
  ): ResponseType {
    const obj = resp({
      message: additionalData?.message ?? 'Created',
      payload: additionalData?.payload || null,
    });

    ctx.status(201);
    return ctx.json(obj);
  }

  public noContent(ctx: Context): ResponseType {
    ctx.status(204);
    return ctx.json(null);
  }

  public badRequest(
    ctx: Context,
    additionalData?: ErrorResponseData
  ): ResponseType {
    const obj = resp({
      code: additionalData?.code ?? 'BAD_REQUEST',
      message: additionalData?.message ?? 'Bad request',
      action: additionalData?.action ?? undefined,
      additionalData: additionalData?.additionalData ?? undefined,
    });

    ctx.status(400);
    return ctx.json(obj);
  }

  public notFound(
    ctx: Context,
    additionalData?: ErrorResponseData
  ): ResponseType {
    const obj = resp({
      code: additionalData?.code ?? 'NOT_FOUND',
      message: additionalData?.message ?? 'Not found',
      action: additionalData?.action ?? undefined,
      additionalData: additionalData?.additionalData ?? undefined,
    });

    ctx.status(404);
    return ctx.json(obj);
  }

  public notAllowed(
    ctx: Context,
    additionalData?: ErrorResponseData
  ): ResponseType {
    const obj = resp({
      code: additionalData?.code ?? 'NOT_ALLOWED',
      message: additionalData?.message ?? 'Not allowed',
      action: additionalData?.action ?? undefined,
      additionalData: additionalData?.additionalData ?? undefined,
    });

    ctx.status(405);
    return ctx.json(obj);
  }
}
