// JSON-LD Schema Generators for OSCAR Fashion

import { siteConfig } from './config';
import type {
  OrganizationSchema,
  ProductSchema,
  BreadcrumbSchema,
  BreadcrumbItem,
  WebSiteSchema,
  CollectionPageSchema,
  ReviewSchema,
  FAQSchema,
  FAQItem,
  AggregateRatingSchema,
} from './types';

// Generate Organization Schema
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    email: siteConfig.organization.email,
    telephone: siteConfig.organization.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.organization.address.city,
      addressRegion: siteConfig.organization.address.region,
      postalCode: siteConfig.organization.address.postalCode,
      addressCountry: siteConfig.organization.address.country,
    },
    sameAs: siteConfig.organization.socialLinks,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.organization.phone,
        contactType: 'customer service',
        areaServed: 'DZ',
        availableLanguage: ['French', 'Arabic', 'English'],
      },
    ],
  };
}

// Generate WebSite Schema with Search Action
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/fr/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Generate Product Schema
export interface ProductSchemaInput {
  name: string;
  description: string;
  slug: string;
  sku?: string;
  images: string[];
  price: number; // in cents
  originalPrice?: number; // in cents
  currency?: string;
  inStock: boolean;
  stockLevel?: number;
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  material?: string;
  rating?: {
    value: number;
    count: number;
  };
  reviews?: Array<{
    author: string;
    date: string;
    content: string;
    rating: number;
  }>;
}

export function generateProductSchema(product: ProductSchemaInput): ProductSchema {
  const price = product.price / 100;
  const currency = product.currency || siteConfig.currency.code;
  const productUrl = `${siteConfig.url}/fr/products/${product.slug}`;

  // Determine availability
  let availability:
    | 'https://schema.org/InStock'
    | 'https://schema.org/OutOfStock'
    | 'https://schema.org/LimitedAvailability' = 'https://schema.org/InStock';
  if (!product.inStock) {
    availability = 'https://schema.org/OutOfStock';
  } else if (product.stockLevel !== undefined && product.stockLevel < 5) {
    availability = 'https://schema.org/LimitedAvailability';
  }

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.length > 0 ? product.images : [`${siteConfig.url}/images/placeholder.png`],
    sku: product.sku,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    category: product.category,
    color: product.color,
    size: product.size,
    material: product.material,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= siteConfig.shipping.freeShippingThreshold * 100 ? 0 : siteConfig.shipping.standardRate,
          currency: currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'DZ',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: siteConfig.shipping.handlingDays.min,
            maxValue: siteConfig.shipping.handlingDays.max,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: siteConfig.shipping.transitDays.min,
            maxValue: siteConfig.shipping.transitDays.max,
            unitCode: 'DAY',
          },
        },
      },
    },
  };

  // Add aggregate rating if available
  if (product.rating && product.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add reviews if available
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewBody: review.content,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return schema;
}

// Generate Breadcrumb Schema
export interface BreadcrumbInput {
  name: string;
  url?: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbInput[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${siteConfig.url}${item.url}` : undefined,
    })),
  };
}

// Generate Collection/Category Page Schema
export interface CollectionSchemaInput {
  name: string;
  description: string;
  slug: string;
  products: Array<{
    name: string;
    slug: string;
    imageUrl?: string;
  }>;
}

export function generateCollectionSchema(collection: CollectionSchemaInput): CollectionPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: `${siteConfig.url}/fr/collections/${collection.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteConfig.url}/fr/products/${product.slug}`,
        name: product.name,
        image: product.imageUrl,
      })),
    },
  };
}

// Generate FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate Local Business Schema (for physical stores if any)
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: siteConfig.organization.name,
    image: `${siteConfig.url}/images/store.jpg`,
    '@id': `${siteConfig.url}/#localbusiness`,
    url: siteConfig.url,
    telephone: siteConfig.organization.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.organization.address.street,
      addressLocality: siteConfig.organization.address.city,
      addressRegion: siteConfig.organization.address.region,
      postalCode: siteConfig.organization.address.postalCode,
      addressCountry: siteConfig.organization.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.7538,
      longitude: 3.0588,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    servesCuisine: undefined, // Not applicable
    acceptsReservations: false,
  };
}

// Render schema as JSON-LD script
export function renderSchema(schema: object): string {
  return JSON.stringify(schema, null, 0);
}

// Combine multiple schemas
export function combineSchemas(...schemas: object[]): object[] {
  return schemas.filter(Boolean);
}
