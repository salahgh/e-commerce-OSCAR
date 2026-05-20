import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oscarfashion.dz';

// Static routes that should appear in every locale's sitemap.
const STATIC_PATHS = [
  '/',
  '/products',
  '/categories',
  '/login',
  '/register',
  '/forgot-password',
];

function localeUrl(locale: string, path: string): string {
  const isDefault = locale === routing.defaultLocale;
  if (isDefault) return `${SITE_URL}${path}`.replace(/\/$/, '') || SITE_URL;
  const prefix = path === '/' ? '' : path;
  return `${SITE_URL}/${locale}${prefix}`;
}

function buildAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    alternates[locale] = localeUrl(locale, path);
  }
  alternates['x-default'] = localeUrl(routing.defaultLocale, path);
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: now,
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1.0 : 0.7,
        alternates: { languages: buildAlternates(path) },
      });
    }
  }

  // TODO: extend with /products/[slug] and /categories/[slug] by fetching slugs
  // from the Vendure Shop API at build time. Backend must be reachable.

  return entries;
}
