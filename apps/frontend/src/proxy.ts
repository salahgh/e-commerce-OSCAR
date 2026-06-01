import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if it's an API route or static file. /shop-api and /assets are
  // proxied to the Vendure backend via next.config.js rewrites — don't run
  // them through next-intl or they get rewritten to a locale-prefixed path
  // that 404s.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/shop-api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Auth is client-side: the session token lives in localStorage (see lib/auth/session.ts)
  // and the Shop API enforces auth on every request, so server middleware cannot see it.
  // Route protection therefore lives in the client (e.g. (user)/layout.tsx). Do NOT gate
  // here — the previous cookies.get('token') check never matched any cookie, so it bounced
  // authenticated users to /login and would have blocked guest checkout.
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|shop-api|assets|_next/static|_next/image|favicon.ico).*)'],
};
