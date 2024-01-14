import { BaseError, env } from '@fake.sh/backend-common';
import { sign, verify } from 'hono/jwt';
import {
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenSignatureMismatched,
} from 'hono/utils/jwt/types';

export type RegisteredJwtClaims = {
  iat: number;
  nbf: number;
  exp: number;
};

export type CustomJwtClaims = {
  id: string;
  email: string;
};

export type JwtClaims = RegisteredJwtClaims & CustomJwtClaims;

export function generateJwt(claims: CustomJwtClaims) {
  return sign(
    {
      ...claims,
      exp: Math.floor(Date.now() / 1000) + env('JWT_EXPIRES_IN', 3600),
      nbf: Math.floor(Date.now() / 1000) - 1,
      iat: Math.floor(Date.now() / 1000),
    },
    env('JWT_SECRET'),
    'HS256'
  );
}

export function verifyJwt(token: string) {
  return verify(token, env('JWT_SECRET'), 'HS256') as Promise<JwtClaims>;
}

export function extractJwtPayload(token: string) {
  return verifyJwt(token).catch((e) => {
    if (
      e instanceof JwtTokenInvalid ||
      e instanceof JwtTokenIssuedAt ||
      e instanceof JwtTokenSignatureMismatched
    ) {
      throw new BaseError({
        statusCode: 401,
        code: 'INVALID_JWT',
        message: 'JWT is invalid',
        action: 'Provide a valid JWT',
      });
    } else if (e instanceof JwtTokenExpired) {
      throw new BaseError({
        statusCode: 401,
        code: 'EXPIRED_JWT',
        message: 'JWT has expired',
        action: 'Provide a valid JWT',
      });
    }

    throw e;
  });
}
