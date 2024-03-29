import backendClientMiddleware from '@lib/middlewares/backend-client-middleware';
import protectMiddleware from '@lib/middlewares/protect-middleware';
import { chain } from '@utils/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  return chain(req, event, [
    backendClientMiddleware(),
    protectMiddleware({
      whenVisited: ['/register', '/login'],
      redirectTo: '/dashboard',
      redirectIfAuthenticated: true,
    }),
    protectMiddleware({
      whenVisited: ['/admin'],
      redirectTo: '/login',
      redirectIfAuthenticated: false,
      requiredPermissions: ['General.CanViewAdminPanel'],
    }),
    protectMiddleware({
      whenVisited: ['/dashboard'],
      redirectTo: '/login',
      redirectIfAuthenticated: false,
    }),
  ]);
}

/*
 * Match every route except the ones listed below:
 * 1. /api/        -> API routes
 * 2. /_next/      -> Next.js internals
 * 3. /_static/    -> inside /public folder
 * 4. /_vercel/    -> Vercel internals
 * 5. /favicon.ico -> favicon
 * 6. /sitemap.xml -> sitemap
 * 7. /robots.txt  -> robots.txt
 */
export const config = {
  matcher: [
    '/((?!api/|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
