import type { Context } from 'hono';

export async function getRequestBodySafe(ctx: Context): Promise<unknown> {
  try {
    return await ctx.req.json();
  } catch (e) {
    return Promise.resolve({}) as Promise<unknown>;
  }
}

export function getRequestHeadersSafe(ctx: Context) {
  return Object.fromEntries(ctx.req.raw.headers.entries());
}
