import { cookies } from 'next/headers';
import BackendClient from '.';

export default async function createServerComponentClient() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- cookies() could be undefined?
  const cookieStr = cookies().toString() ?? '';

  const client = new BackendClient();
  client.loadFromCookies(cookieStr, '__fakesh');

  if (!client.isTokenValid()) {
    client.clearToken();
  } else {
    await client.refreshToken();
  }

  return client;
}
