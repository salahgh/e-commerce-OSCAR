// SEO Types for OSCAR Fashion

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName?: string;
  locale?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  images?: OpenGraphImage[];
}

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface TwitterCardData {
  card?: 'summary' | 'summary_large_image' | 'player' | 'app';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

// JSON-LD Schema Types
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  areaServed?: string | string[];
  availableLanguage?: string | string[];
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  mpn?: string;
  brand?: BrandSchema;
  offers: OfferSchema | OfferSchema[];
  aggregateRating?: AggregateRatingSchema;
  review?: ReviewSchema[];
  category?: string;
  color?: string;
  material?: string;
  size?: string;
}

export interface BrandSchema {
  '@type': 'Brand';
  name: string;
  logo?: string;
}

export interface OfferSchema {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  price: number;
  priceValidUntil?: string;
  availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder' | 'https://schema.org/LimitedAvailability';
  itemCondition?: 'https://schema.org/NewCondition' | 'https://schema.org/UsedCondition' | 'https://schema.org/RefurbishedCondition';
  seller?: OrganizationSchema;
  shippingDetails?: ShippingDetailsSchema;
}

export interface ShippingDetailsSchema {
  '@type': 'OfferShippingDetails';
  shippingRate?: {
    '@type': 'MonetaryAmount';
    value: number;
    currency: string;
  };
  shippingDestination?: {
    '@type': 'DefinedRegion';
    addressCountry: string;
  };
  deliveryTime?: {
    '@type': 'ShippingDeliveryTime';
    handlingTime?: {
      '@type': 'QuantitativeValue';
      minValue: number;
      maxValue: number;
      unitCode: 'DAY';
    };
    transitTime?: {
      '@type': 'QuantitativeValue';
      minValue: number;
      maxValue: number;
      unitCode: 'DAY';
    };
  };
}

export interface AggregateRatingSchema {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ReviewSchema {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: SearchActionSchema;
}

export interface SearchActionSchema {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

export interface CollectionPageSchema {
  '@context': 'https://schema.org';
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  mainEntity?: {
    '@type': 'ItemList';
    itemListElement: ItemListElement[];
  };
}

export interface ItemListElement {
  '@type': 'ListItem';
  position: number;
  url: string;
  name: string;
  image?: string;
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: FAQItem[];
}

export interface FAQItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}
