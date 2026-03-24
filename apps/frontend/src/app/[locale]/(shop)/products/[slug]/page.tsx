import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema, siteConfig, stripHtml, truncateDescription } from '@/lib/seo';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import ProductDetailClient from './ProductDetailClient';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085/shop-api';

// GraphQL query to fetch product
const GET_PRODUCT_QUERY = `
  query GetProductBySlug($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        preview
        source
      }
      variants {
        id
        sku
        name
        priceWithTax
        stockLevel
        options {
          id
          name
          group {
            code
            name
          }
        }
      }
      collections {
        id
        slug
        name
      }
      facetValues {
        id
        name
        facet {
          name
        }
      }
    }
  }
`;

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: {
    id: string;
    preview: string;
    source: string;
  };
  assets: Array<{
    id: string;
    preview: string;
    source: string;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    priceWithTax: number;
    stockLevel: string;
    options: Array<{
      id: string;
      name: string;
      group: {
        code: string;
        name: string;
      };
    }>;
  }>;
  collections?: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  facetValues?: Array<{
    id: string;
    name: string;
    facet: {
      name: string;
    };
  }>;
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_PRODUCT_QUERY,
        variables: { slug },
      }),
      next: { revalidate: 60 }, // Revalidate every minute
    });

    const { data, errors } = await response.json();

    if (errors || !data?.product) {
      return null;
    }

    return data.product;
  } catch (error) {
    console.error('[Product Page] Failed to fetch product:', error);
    return null;
  }
}

// Generate metadata for the product page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produit non trouve',
      description: 'Le produit que vous recherchez n\'existe pas.',
    };
  }

  const images = [
    ...(product.featuredAsset ? [product.featuredAsset.preview] : []),
    ...product.assets.map((a) => a.preview),
  ].slice(0, 4);

  const price = product.variants[0]?.priceWithTax || 0;
  const category = product.collections?.[0]?.name;
  const brand = product.facetValues?.find((fv) => fv.facet.name.toLowerCase() === 'brand')?.name;

  return generateProductMetadata({
    name: product.name,
    description: truncateDescription(stripHtml(product.description)),
    slug: product.slug,
    images,
    price,
    currency: 'DZD',
    category,
    brand,
    locale,
  });
}

// Main page component
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Prepare data for structured data
  const images = [
    ...(product.featuredAsset ? [product.featuredAsset.preview] : []),
    ...product.assets.map((a) => a.preview),
  ];

  const price = product.variants[0]?.priceWithTax || 0;
  const sku = product.variants[0]?.sku;
  const inStock = product.variants.some((v) => v.stockLevel !== 'OUT_OF_STOCK');
  const category = product.collections?.[0]?.name;
  const brand = product.facetValues?.find((fv) => fv.facet.name.toLowerCase() === 'brand')?.name;

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Accueil', url: `/${locale}` },
    { name: 'Produits', url: `/${locale}/products` },
    ...(product.collections?.[0]
      ? [{ name: product.collections[0].name, url: `/${locale}/collections/${product.collections[0].slug}` }]
      : []),
    { name: product.name },
  ];

  // Product schema data
  const productSchemaData = {
    name: product.name,
    description: stripHtml(product.description),
    slug: product.slug,
    sku,
    images,
    price,
    currency: 'DZD',
    inStock,
    brand,
    category,
  };

  return (
    <>
      {/* Structured Data */}
      <ProductJsonLd product={productSchemaData} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Client Component */}
      <ProductDetailClient product={product} />
    </>
  );
}

// Generate static params for common products (optional optimization)
// export async function generateStaticParams() {
//   // Fetch popular products for pre-rendering
//   return [];
// }
