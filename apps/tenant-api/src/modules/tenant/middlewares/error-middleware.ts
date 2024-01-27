import { BaseError, log, resp } from '@fake.sh/backend-common';
import { getRequestBodySafe, getRequestHeadersSafe } from '@utils/request';
import type { ErrorHandler } from 'hono';
import TenantService from '../tenant-service';

export default function errorMiddleware(): ErrorHandler {
  return async (error, ctx) => {
    const project = ctx.get('project');
    const schema = ctx.get('schema');

    const tenantService = new TenantService();

    const logsTableName =
      project !== undefined && schema !== undefined
        ? `schema_${project.id}_${schema.id}_logs`
        : undefined;

    if (error instanceof BaseError) {
      const response = resp({
        code: error.code,
        message: error.message,
        action: error.action,
        additionalData: error.additionalData,
      });

      logsTableName &&
        (await tenantService.insertLogImpl(logsTableName, {
          url: ctx.req.url,
          method: ctx.req.method,
          status_code: error.statusCode,
          body: await getRequestBodySafe(ctx.req.raw),
          headers: getRequestHeadersSafe(ctx.req.raw),
        }));

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

    logsTableName &&
      (await tenantService.insertLogImpl(logsTableName, {
        url: ctx.req.url,
        method: ctx.req.method,
        status_code: 500,
        body: await getRequestBodySafe(ctx.req.raw),
        headers: getRequestHeadersSafe(ctx.req.raw),
      }));

    log.fatal(error);
    ctx.status(500);
    return ctx.json(response);
  };
}
