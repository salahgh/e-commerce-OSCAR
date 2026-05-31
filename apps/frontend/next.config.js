const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

// Bundle analyzer - enable with ANALYZE=true
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image Optimization
  images: {
    // Use unoptimized images in development to avoid private IP issues with localhost
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8085',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8085',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.oscarfashion.dz',
      },
      {
        protocol: 'https',
        hostname: 'cdn.oscarfashion.dz',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Modern formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Enable experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash',
      '@radix-ui/react-icons',
      'framer-motion',
    ],
  },

  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // Caching headers for optimal performance
  async headers() {
    return [
      // Security and general headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      // Static assets - long cache
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images - long cache with revalidation
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // JS/CSS chunks - immutable
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API responses - short cache with revalidation
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // Redirects for performance
  async rewrites() {
    // In local dev we proxy /shop-api and /assets to the VPS so the browser
    // sees same-origin requests (no CORS), while the API itself stays remote.
    // Triggered when NEXT_PUBLIC_API_PROXY_TARGET is set in .env.local.
    const proxyTarget = process.env.NEXT_PUBLIC_API_PROXY_TARGET;
    const proxyRewrites = proxyTarget
      ? [
          { source: '/shop-api/:path*', destination: `${proxyTarget}/shop-api/:path*` },
          { source: '/shop-api', destination: `${proxyTarget}/shop-api` },
          { source: '/assets/:path*', destination: `${proxyTarget}/assets/:path*` },
        ]
      : [];
    return {
      beforeFiles: proxyRewrites,
      afterFiles: [],
      fallback: [],
    };
  },
};

// Chain plugins
module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
