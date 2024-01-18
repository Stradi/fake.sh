import BackendClient from '.';

export default async function createClientComponentClient() {
  const cookieStr = document.cookie;

  const client = new BackendClient();
  client.loadFromCookies(cookieStr, '__bforum');

  if (!client.isTokenValid()) {
    client.clearToken();
  } else {
    await client.refreshToken();
  }

  return client;
}
