import type { Handler } from '@fake.sh/backend-common';
import { BaseController, ResourceNotFoundError } from '@fake.sh/backend-common';
import AccountsService from '@modules/accounts/accounts-service';
import { extractJwtPayload, generateJwt, type JwtClaims } from '@utils/jwt';
import type { Context } from 'hono';
import { setCookie as _setCookie } from 'hono/cookie';
import { LoginBody, RefreshTokenBody, RegisterBody } from './auth-dto';
import AuthService from './auth-service';

export default class AuthController extends BaseController {
  private readonly accountsService = new AccountsService();
  private readonly authService = new AuthService();

  public router() {
    return this._app
      .get('/auth/me', this.me)
      .post('/auth/login', this.login)
      .post('/auth/register', this.register)
      .post('/auth/refresh-token', this.refreshToken)
      .post('/auth/logout', this.logout);
  }

  protected me: Handler<'/auth/me'> = async (ctx) => {
    const jwtPayload = ctx.get('jwtPayload') as JwtClaims;

    const account = await this.accountsService.show(jwtPayload.id);

    return this.ok(ctx, {
      message: 'Fetched authenticated account successfully',
      payload: account,
    });
  };

  protected login: Handler<'/auth/login'> = async (ctx) => {
    const body = await this.validateBody(ctx, LoginBody);

    const account = await this.authService.login(body);
    const token = await generateJwt({
      id: account.id,
      email: account.email,
      groups: account.accountGroup.map((ag) => ag.group.name),
    });

    this.setCookie(ctx, token);
    return this.ok(ctx, {
      message: 'Logged in successfully',
      payload: token,
    });
  };

  protected register: Handler<'/auth/register'> = async (ctx) => {
    const body = await this.validateBody(ctx, RegisterBody);

    const record = await this.authService.register(body);
    const token = await generateJwt({
      id: record.account.id,
      email: record.account.email,
      groups: record.groups.map((g) => g.name),
    });

    this.setCookie(ctx, token);
    return this.ok(ctx, {
      message: 'Registered successfully',
      payload: token,
    });
  };

  protected refreshToken: Handler<'/auth/refresh-token'> = async (ctx) => {
    const body = await this.validateBody(ctx, RefreshTokenBody);

    const jwtPayload = await extractJwtPayload(body.refresh_token);

    const account = await this.accountsService.show(jwtPayload.id);
    if (!account) {
      throw new ResourceNotFoundError('Account', jwtPayload.id);
    }

    const newToken = await generateJwt({
      ...jwtPayload,
      id: account.id,
      email: account.email,
      groups: account.accountGroup.map((ag) => ag.group.name),
    });

    this.setCookie(ctx, newToken);
    return this.ok(ctx, {
      message: 'Refreshed token successfully',
      payload: newToken,
    });
  };

  protected logout: Handler<'/auth/logout'> = (ctx) => {
    this.removeCookie(ctx);

    return this.ok(ctx, {
      message: 'Logged out successfully',
    });
  };

  private setCookie(ctx: Context, token: string) {
    _setCookie(ctx, '__fakesh', JSON.stringify({ token }), {
      httpOnly: true,
      maxAge: 60 * 60 * 1,
      path: '/',
    });
  }

  private removeCookie(ctx: Context) {
    _setCookie(ctx, '__fakesh', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
  }
}
