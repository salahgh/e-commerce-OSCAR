// SEO Library Exports

// Types
export * from './types';

// Config
export { siteConfig, pageMeta, localeConfig } from './config';

// Schema Generators
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  renderSchema,
  combineSchemas,
  type ProductSchemaInput,
  type BreadcrumbInput,
  type CollectionSchemaInput,
} from './schema';

// Metadata Generators
export {
  generateMetadata,
  generateProductMetadata,
  generateCollectionMetadata,
  generateSearchMetadata,
  stripHtml,
  truncateDescription,
  type ProductMetadataInput,
  type CollectionMetadataInput,
} from './metadata';
