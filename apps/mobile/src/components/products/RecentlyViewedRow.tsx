import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import { HorizontalProductRow, SimpleProduct } from './HorizontalProductRow';

export function RecentlyViewedRow({ excludeProductId }: { excludeProductId?: string }) {
  const { t } = useTranslation();
  const { items } = useRecentlyViewed();

  const products: SimpleProduct[] = items
    .filter((e) => e.productId !== excludeProductId)
    .map((e) => ({
      id: e.productId,
      slug: e.slug,
      name: e.name,
      imageUrl: e.imageUrl,
      price: e.price,
      currencyCode: e.currencyCode,
    }));

  return (
    <HorizontalProductRow title={t('products.recentlyViewed', 'Recently viewed')} products={products} />
  );
}
