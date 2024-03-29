import { cookieParse, cookieSerialize } from '@utils/cookie';
import { parseJwt } from '@utils/jwt';
import type { ApiAccount } from '../backend-types';

type SuccessResponse<Data = unknown> = {
  success: true;
  data: Data;
  error: null;
};

type ErrorResponse<AdditionalData = unknown> = {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    action?: string;
    additionalData?: AdditionalData;
  };
};

export type ApiResponse<Data = unknown, AdditionalData = unknown> =
  | SuccessResponse<Data>
  | ErrorResponse<AdditionalData>;

export default class BackendClient {
  private baseUrl = 'http://localhost:3001';
  private authToken: string | null;

  public isAuthenticated() {
    return Boolean(this.authToken) && this.isTokenValid();
  }

  public loadFromCookies(cookies: string, key: string) {
    const raw = cookieParse(cookies)[key];
    const data = raw ? JSON.parse(raw as string) : null;

    if (!data) return;
    this.authToken = data.token;
  }

  public exportToCookie(key: string) {
    // We are serializing a JSON object because we may want to add more data to the cookie in the future.
    const data = {
      token: this.authToken,
    };

    return cookieSerialize(key, JSON.stringify(data), {
      httpOnly: true,
      maxAge: 60 * 60 * 1, // 1 hour
      path: '/',
    });
  }

  isTokenValid() {
    if (!this.authToken) {
      return false;
    }

    const payload = parseJwt(this.authToken);
    if (!payload.exp || payload.exp < Date.now() / 1000) {
      return false;
    }

    return true;
  }

  clearToken() {
    this.authToken = null;
  }

  async refreshToken() {
    const newToken = await this.sendRequest<{
      payload: string;
    }>('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: this.authToken,
      }),
    });

    if (newToken.success) {
      this.authToken = newToken.data.payload;
    } else {
      this.clearToken();
    }
  }

  async getAuthenticatedAccount() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const account = await this.sendRequest<{
      message: string;
      payload: ApiAccount;
    }>('/api/v1/auth/me');

    if (!account.success) {
      return null;
    }

    return account.data.payload;
  }

  async checkPermission(permissionName: string) {
    const permissionResponse = await this.sendRequest<{
      message: string;
      payload: boolean;
    }>('/api/v1/permissions/canPerform', {
      method: 'POST',
      body: JSON.stringify({
        permission_name: permissionName,
      }),
    });

    if (!permissionResponse.success) {
      return false;
    }

    return permissionResponse.data.payload;
  }

  public async sendRequest<Data = unknown, AdditionalData = unknown>(
    path: string,
    options?: RequestInit
  ): Promise<ApiResponse<Data, AdditionalData>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...options?.headers,
        cookie: this.exportToCookie('__fakesh'),
      },
      credentials: 'include',
    });

    return response.json() as Promise<ApiResponse<Data, AdditionalData>>;
  }
}
