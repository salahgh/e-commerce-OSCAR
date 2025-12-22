// JSON-LD Component for Structured Data

import React from 'react';

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
        />
      ))}
    </>
  );
}

// Pre-built components for common schemas
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateFAQSchema,
  type ProductSchemaInput,
  type BreadcrumbInput,
  type CollectionSchemaInput,
} from '@/lib/seo/schema';

// Organization Schema Component
export function OrganizationJsonLd() {
  return <JsonLd data={generateOrganizationSchema()} />;
}

// WebSite Schema Component (includes search action)
export function WebSiteJsonLd() {
  return <JsonLd data={generateWebSiteSchema()} />;
}

// Product Schema Component
interface ProductJsonLdProps {
  product: ProductSchemaInput;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  return <JsonLd data={generateProductSchema(product)} />;
}

// Breadcrumb Schema Component
interface BreadcrumbJsonLdProps {
  items: BreadcrumbInput[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return <JsonLd data={generateBreadcrumbSchema(items)} />;
}

// Collection Schema Component
interface CollectionJsonLdProps {
  collection: CollectionSchemaInput;
}

export function CollectionJsonLd({ collection }: CollectionJsonLdProps) {
  return <JsonLd data={generateCollectionSchema(collection)} />;
}

// FAQ Schema Component
interface FAQJsonLdProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  return <JsonLd data={generateFAQSchema(faqs)} />;
}

// Combined Home Page Schema
export function HomePageJsonLd() {
  return (
    <JsonLd
      data={[
        generateOrganizationSchema(),
        generateWebSiteSchema(),
      ]}
    />
  );
}
