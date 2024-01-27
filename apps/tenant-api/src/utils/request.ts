export async function getRequestBodySafe(req: Request): Promise<unknown> {
  try {
    return await req.clone().json();
  } catch (e) {
    return Promise.resolve({}) as Promise<unknown>;
  }
}

export function getRequestHeadersSafe(req: Request) {
  return Object.fromEntries(req.headers.entries());
}
