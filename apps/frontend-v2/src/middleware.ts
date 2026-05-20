import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except: Next.js internals, API routes, the Vendure proxy
  // paths (proxied by next.config.js rewrites — must not go through next-intl),
  // and files with extensions.
  matcher: '/((?!api|shop-api|assets|trpc|_next|_vercel|.*\\..*).*)',
};
