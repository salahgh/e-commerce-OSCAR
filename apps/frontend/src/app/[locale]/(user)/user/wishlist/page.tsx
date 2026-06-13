'use client';

import { useTranslations } from 'next-intl';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui';
import { ProductCard, type ProductCardData } from '@/components/patterns';

export default function WishlistPage() {
  const t = useTranslations('WishlistPage');
  const { items } = useWishlist();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-right text-24 font-bold text-accent">{t('title')}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-hairline bg-bg-subtle p-6">
          <p className="text-16 text-content-muted">{t('empty')}</p>
          <Button asChild>
            <Link href="/products">{t('shopCta')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const card: ProductCardData = {
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl ?? null,
              price: item.price ?? 0,
              currencyCode: item.currencyCode ?? 'DZD',
            };
            return <ProductCard key={item.slug} product={card} />;
          })}
        </div>
      )}
    </div>
  );
}
