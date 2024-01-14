import type { NotFoundHandler } from 'hono';
import { resp } from '../../utils/response';

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
