import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private/authenticated pages
          '/*/user/',
          '/*/cart',
          '/*/checkout/',
          '/*/order-confirmation',

          // Auth pages
          '/*/login',
          '/*/register',
          '/*/forgot-password',
          '/*/reset-password',

          // API routes
          '/api/',

          // Internal/system paths
          '/_next/',
          '/static/',

          // Search with specific parameters (allow main search)
          '/*/search?page=*',

          // Admin/debug paths
          '/admin/',
          '/debug/',
        ],
      },
      {
        // Block specific crawlers that don't respect robots.txt well
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
