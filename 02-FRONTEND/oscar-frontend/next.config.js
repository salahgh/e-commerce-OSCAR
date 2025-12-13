const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.oscarfashion.dz',
      },
      {
        protocol: 'https',
        hostname: 'cdn.oscarfashion.dz',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Removed optimizeCss as it requires critters package
  // experimental: {
  //   optimizeCss: true,
  // },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  },
};

module.exports = withNextIntl(nextConfig);
