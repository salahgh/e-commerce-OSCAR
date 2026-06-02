'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@oscar/shared';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from '@/i18n/routing';
import { Button, Card, IconButton } from '@/components/ui';

export default function WishlistPage() {
  const t = useTranslations('WishlistPage');
  const { items, remove } = useWishlist();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('subtitle')}</p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded border border-border bg-bg-subtle p-6">
          <p className="text-14 text-content-muted">{t('empty')}</p>
          <Button asChild>
            <Link href="/products">{t('shopCta')}</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug}>
              <Card padding="md" className="flex h-full flex-col gap-3">
                <div className="relative aspect-square overflow-hidden rounded bg-bg-muted">
                  {item.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-14 font-medium text-content-strong hover:underline"
                  >
                    {item.name}
                  </Link>
                  <IconButton
                    aria-label={t('remove')}
                    intent="ghost"
                    size="sm"
                    onClick={() => remove(item.slug)}
                  >
                    <Trash2 className="h-4 w-4 text-state-danger-content" />
                  </IconButton>
                </div>
                {item.price !== undefined && item.currencyCode && (
                  <p className="text-12 font-medium text-content-strong">
                    {formatPrice(item.price, item.currencyCode)}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
