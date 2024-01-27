import type { Context, Env, Next } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';
import PermissionError from '../utils/errors/permission-error';
import ValidationError from '../utils/errors/validation-error';
import type { ErrorResponseData, SuccessResponseData } from '../utils/response';
import { resp } from '../utils/response';

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

  public async checkPolicy<T, F extends keyof T>(
    policy: T,
    fn: F,
    // @ts-expect-error -- hmm, weird.
    ...args: Parameters<T[F]>
  ): Promise<void> {
    const policyFnTypeSafe = policy[fn] as unknown as (
      ...args: unknown[]
    ) => Promise<boolean>;

    const boundMethod = policyFnTypeSafe.bind(policy);
    const allowed = await boundMethod(...args);

    if (!allowed) {
      throw new PermissionError();
    }
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

  public async validateBody<T>(ctx: Context, schema: z.Schema<T>): Promise<T> {
    const body = await ctx.req.raw.clone().json();
    return this.validate(body, schema);
  }

  public validateQuery<T>(ctx: Context, schema: z.Schema<T>): T {
    const queries = ctx.req.queries();
    const normalizedQuery = Object.keys(queries).reduce<
      Record<string, unknown>
    >((acc, key) => {
      const value = queries[key];
      acc[key] = value.length === 1 ? value[0] : value;
      return acc;
    }, {});

    return this.validate(normalizedQuery, schema);
  }

  private validate<T>(obj: unknown, schema: z.Schema<T>): T {
    try {
      return schema.parse(obj);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error);
      }

      throw error;
    }
  }
}
