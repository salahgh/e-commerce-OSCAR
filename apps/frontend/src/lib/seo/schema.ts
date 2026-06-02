/**
 * JSON-LD structured-data builders (schema.org) for the OSCAR Najar storefront.
 * Pure functions, safe on both server and client. Brand identity is inlined
 * here (OSCAR has no shared brand module).
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://oscarfashion.dz').replace(/\/$/, '');

const BRAND = {
  name: 'OSCAR Najar',
  legalName: 'OSCAR Najar',
  email: '',
  sameAs: [] as string[],
};

function abs(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: abs('/icons/icon-512.png'),
    ...(BRAND.email ? { email: BRAND.email } : {}),
    ...(BRAND.sameAs.length ? { sameAs: BRAND.sameAs } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BRAND.name,
    url: SITE_URL,
    inLanguage: ['fr', 'en', 'ar'],
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface ProductSchemaInput {
  name: string;
  description?: string;
  image?: string | string[];
  /** Absolute URL or site-relative path for the product page. */
  url: string;
  sku?: string;
  brandName?: string;
  /** Whole-unit price (already converted from Vendure cents). */
  price: number;
  priceCurrency: string;
  inStock?: boolean;
}

export function productSchema(p: ProductSchemaInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: p.image } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brandName ? { brand: { '@type': 'Brand', name: p.brandName } } : {}),
    offers: {
      '@type': 'Offer',
      url: abs(p.url),
      price: p.price.toFixed(2),
      priceCurrency: p.priceCurrency || 'DZD',
      availability: `https://schema.org/${p.inStock === false ? 'OutOfStock' : 'InStock'}`,
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  };
}

export interface Crumb {
  name: string;
  /** Absolute URL or site-relative path. */
  url: string;
}

export function breadcrumbSchema(items: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}
