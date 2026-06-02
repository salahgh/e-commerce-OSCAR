import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetCollectionWithProductsQuery,
  useGetProductsQuery,
} from '../../graphql/generated/graphql';
import { formatPrice } from '../../utils/vendureAdapters';
import { HorizontalProductRow, SimpleProduct } from './HorizontalProductRow';

interface RelatedProductsProps {
  /** Slug of the current product's first collection — pass an empty string to skip the collection query. */
  collectionSlug?: string | null;
  /** Current product id, excluded from the results. */
  currentProductId: string;
}

export function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
  const { t } = useTranslation();

  const hasCollection = !!collectionSlug;
  const collectionQuery = useGetCollectionWithProductsQuery({
    variables: { slug: collectionSlug ?? '', take: 12, skip: 0 },
    skip: !hasCollection,
  });
  const recentQuery = useGetProductsQuery({
    variables: { options: { take: 12 } },
    skip: hasCollection,
  });

  const products = useMemo<SimpleProduct[]>(() => {
    const source: any[] = hasCollection
      ? (collectionQuery.data?.collection?.productVariants?.items ?? [])
          .map((v: any) => v.product)
          .filter(Boolean)
      : (recentQuery.data?.products?.items ?? []);

    const seen = new Set<string>([currentProductId]);
    const out: SimpleProduct[] = [];
    for (const p of source) {
      if (!p || seen.has(p.id)) continue;
      seen.add(p.id);
      const variant = p.variants?.[0];
      out.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.featuredAsset?.preview ?? null,
        price: variant ? formatPrice(variant.priceWithTax) : 0,
        currencyCode: variant?.currencyCode ?? 'DZD',
      });
      if (out.length >= 6) break;
    }
    return out;
  }, [hasCollection, collectionQuery.data, recentQuery.data, currentProductId]);

  return <HorizontalProductRow title={t('products.related', 'You may also like')} products={products} />;
}
