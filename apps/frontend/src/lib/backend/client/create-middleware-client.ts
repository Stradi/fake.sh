import type { NextRequest, NextResponse } from 'next/server';
import BackendClient from '.';

export default async function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const cookieStr = request.headers.get('Cookie') ?? '';

  const client = new BackendClient();
  client.loadFromCookies(cookieStr, '__fakesh');

  if (!client.isTokenValid()) {
    client.clearToken();
  } else {
    await client.refreshToken();
  }

  response.headers.append('Set-Cookie', client.exportToCookie('__fakesh'));
  return client;
}
