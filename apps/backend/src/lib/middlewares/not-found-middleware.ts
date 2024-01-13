import { resp } from '@utils/response';
import type { NotFoundHandler } from 'hono';

export default function notFoundMiddleware(): NotFoundHandler {
  return (ctx) => {
    const obj = resp({
      code: 'NOT_FOUND',
      message: 'This endpoint does not exist',
      action: 'Check the URL you are trying to access',
      additionalData: {
        path: ctx.req.path,
      },
    });

    ctx.status(404);
    return ctx.json(obj);
  };
}
