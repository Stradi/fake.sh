import type BackendClient from './client';

export function login(
  client: BackendClient | null,
  data: {
    email: string;
    password: string;
  }
) {
  if (!client) throw new Error('Backend API Client is not initialized');

  return client.sendRequest<{
    message: string;
    payload: {
      token: string;
    };
  }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function register(
  client: BackendClient | null,
  data: {
    email: string;
    password: string;
  }
) {
  if (!client) throw new Error('Backend API Client is not initialized');

  return client.sendRequest<{
    message: string;
    payload: {
      token: string;
    };
  }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function logout(client: BackendClient | null) {
  if (!client) throw new Error('Backend API Client is not initialized');

  return client.sendRequest<{ message: string }>('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
