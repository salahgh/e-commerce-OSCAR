const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8085', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8085', pathname: '/**' },
      { protocol: 'https', hostname: 'api.oscarfashion.dz' },
      { protocol: 'https', hostname: 'cdn.oscarfashion.dz' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  // In local dev we proxy /shop-api and /assets to the VPS so the browser
  // sees same-origin requests (no CORS), while the API stays remote.
  // Enabled when NEXT_PUBLIC_API_PROXY_TARGET is set in .env.local.
  async rewrites() {
    const proxyTarget = process.env.NEXT_PUBLIC_API_PROXY_TARGET;
    if (!proxyTarget) return [];
    return {
      beforeFiles: [
        { source: '/shop-api/:path*', destination: `${proxyTarget}/shop-api/:path*` },
        { source: '/shop-api', destination: `${proxyTarget}/shop-api` },
        { source: '/assets/:path*', destination: `${proxyTarget}/assets/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = withNextIntl(nextConfig);
