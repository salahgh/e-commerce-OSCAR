import { MetadataRoute } from 'next';
import { siteConfig, localeConfig } from '@/lib/seo';

// GraphQL endpoint for fetching products and collections
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api';

// Fetch products for sitemap
async function fetchProducts(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetProductsForSitemap {
            products(options: { take: 1000 }) {
              items {
                slug
                updatedAt
              }
            }
          }
        `,
      }),
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    const { data } = await response.json();
    return data?.products?.items || [];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch products:', error);
    return [];
  }
}

// Fetch collections for sitemap
async function fetchCollections(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetCollectionsForSitemap {
            collections(options: { take: 100 }) {
              items {
                slug
                updatedAt
              }
            }
          }
        `,
      }),
      next: { revalidate: 3600 },
    });

    const { data } = await response.json();
    return data?.collections?.items || [];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch collections:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const locales = Object.keys(localeConfig);

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/search', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/shipping', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/returns', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Generate static page entries for all locales
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [
            localeConfig[loc]?.hreflang || loc,
            `${baseUrl}/${loc}${page.path}`,
          ])
        ),
      },
    }))
  );

  // Fetch dynamic content
  const [products, collections] = await Promise.all([
    fetchProducts(),
    fetchCollections(),
  ]);

  // Generate product entries for all locales
  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [
            localeConfig[loc]?.hreflang || loc,
            `${baseUrl}/${loc}/products/${product.slug}`,
          ])
        ),
      },
    }))
  );

  // Generate collection entries for all locales
  const collectionEntries: MetadataRoute.Sitemap = collections.flatMap((collection) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/collections/${collection.slug}`,
      lastModified: new Date(collection.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [
            localeConfig[loc]?.hreflang || loc,
            `${baseUrl}/${loc}/collections/${collection.slug}`,
          ])
        ),
      },
    }))
  );

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
