// Metadata Generation Utilities for Next.js

import { Metadata } from 'next';
import { siteConfig, localeConfig } from './config';
import type { SEOMetadata, OpenGraphData, TwitterCardData } from './types';

interface GenerateMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  locale?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  openGraph?: Partial<OpenGraphData>;
  twitter?: Partial<TwitterCardData>;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  alternateLocales?: string[];
}

// Generate complete metadata object for Next.js
export function generateMetadata(options: GenerateMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = siteConfig.defaultMeta.keywords,
    canonical,
    locale = siteConfig.defaultLocale,
    noIndex = false,
    noFollow = false,
    openGraph,
    twitter,
    images = [],
    alternateLocales = siteConfig.locales,
  } = options;

  const fullTitle = title.includes(siteConfig.name)
    ? title
    : siteConfig.defaultMeta.titleTemplate.replace('%s', title);

  const canonicalUrl = canonical
    ? `${siteConfig.url}${canonical}`
    : undefined;

  const ogImages = images.length > 0
    ? images.map((img) => ({
        url: img.url.startsWith('http') ? img.url : `${siteConfig.url}${img.url}`,
        width: img.width || 1200,
        height: img.height || 630,
        alt: img.alt || title,
      }))
    : [{
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      }];

  // Generate alternate language links
  const languages: Record<string, string> = {};
  alternateLocales.forEach((loc) => {
    const path = canonical || '';
    languages[localeConfig[loc]?.hreflang || loc] = `${siteConfig.url}/${loc}${path}`;
  });

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),

    // Canonical URL
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
        languages,
      },
    }),

    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph
    openGraph: {
      title: openGraph?.title || fullTitle,
      description: openGraph?.description || description,
      url: openGraph?.url || canonicalUrl || siteConfig.url,
      siteName: siteConfig.name,
      locale: localeConfig[locale]?.locale || 'fr_DZ',
      type: openGraph?.type || 'website',
      images: ogImages,
    },

    // Twitter
    twitter: {
      card: twitter?.card || 'summary_large_image',
      title: twitter?.title || fullTitle,
      description: twitter?.description || description,
      site: siteConfig.twitterHandle,
      creator: twitter?.creator || siteConfig.twitterHandle,
      images: ogImages.map((img) => img.url),
    },

    // Other meta
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.organization.name }],
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',

    // Icons - will use default Next.js favicon if not present
    // icons: {
    //   icon: '/favicon.ico',
    //   shortcut: '/favicon-16x16.png',
    //   apple: '/apple-touch-icon.png',
    // },

    // Manifest
    manifest: '/manifest.json',

    // Verification (add your IDs)
    // verification: {
    //   google: 'your-google-verification-id',
    //   yandex: 'your-yandex-verification-id',
    // },
  };

  return metadata;
}

// Generate product page metadata
export interface ProductMetadataInput {
  name: string;
  description: string;
  slug: string;
  images: string[];
  price: number;
  currency?: string;
  category?: string;
  brand?: string;
  locale?: string;
}

export function generateProductMetadata(product: ProductMetadataInput): Metadata {
  const priceFormatted = new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: product.currency || 'DZD',
    minimumFractionDigits: 0,
  }).format(product.price / 100);

  const title = `${product.name} - ${priceFormatted}`;
  const description = product.description.length > 155
    ? `${product.description.substring(0, 152)}...`
    : product.description;

  return generateMetadata({
    title,
    description,
    canonical: `/${product.locale || 'fr'}/products/${product.slug}`,
    locale: product.locale,
    keywords: [
      product.name,
      product.brand || '',
      product.category || '',
      'acheter',
      'prix',
      'algerie',
    ].filter(Boolean),
    images: product.images.slice(0, 4).map((url) => ({
      url,
      alt: product.name,
    })),
    openGraph: {
      type: 'website',
    },
  });
}

// Generate collection page metadata
export interface CollectionMetadataInput {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
  locale?: string;
}

export function generateCollectionMetadata(collection: CollectionMetadataInput): Metadata {
  const title = collection.name;
  const description = collection.productCount
    ? `${collection.description} Decouvrez ${collection.productCount} produits.`
    : collection.description;

  return generateMetadata({
    title,
    description,
    canonical: `/${collection.locale || 'fr'}/collections/${collection.slug}`,
    locale: collection.locale,
    keywords: [
      collection.name,
      'collection',
      'mode',
      'vetements',
      'algerie',
    ],
    images: collection.imageUrl ? [{ url: collection.imageUrl, alt: collection.name }] : [],
  });
}

// Generate search page metadata
export function generateSearchMetadata(query: string, resultsCount: number, locale?: string): Metadata {
  const title = query
    ? `Recherche: "${query}" - ${resultsCount} resultats`
    : 'Recherche de produits';

  return generateMetadata({
    title,
    description: query
      ? `${resultsCount} produits trouves pour "${query}" sur OSCAR Fashion.`
      : 'Recherchez parmi notre catalogue de produits mode.',
    canonical: `/${locale || 'fr'}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
    locale,
    noIndex: !query, // Index search pages with queries only
  });
}

// Helper to strip HTML from description
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Truncate text for meta description
export function truncateDescription(text: string, maxLength = 155): string {
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return `${stripped.substring(0, maxLength - 3)}...`;
}
