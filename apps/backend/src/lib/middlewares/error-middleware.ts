import BaseError from '@utils/errors/base-error';
import { log } from '@utils/logger';
import { resp } from '@utils/response';
import type { ErrorHandler } from 'hono';

export default function errorMiddleware(): ErrorHandler {
  return (error, ctx) => {
    if (error instanceof BaseError) {
      const response = resp({
        code: error.code,
        message: error.message,
        action: error.action,
        additionalData: error.additionalData,
      });

      log.error(error);
      ctx.status(error.statusCode);
      return ctx.json(response);
    }

    const response = resp(
      new BaseError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
        action: 'Please try again later',
      })
    );

    log.fatal(error);
    ctx.status(500);
    return ctx.json(response);
  };
}
