'use client';

import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDzd, formatDzdTotal } from '@/lib/format/price';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@/i18n/routing';
import { Button, Skeleton } from '@/components/ui';

export default function CartPage() {
  const t = useTranslations('CartPage');
  const tSummary = useTranslations('CartPage.summary');
  const tEmpty = useTranslations('CartPage.empty');
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const locale = useLocale();

  if (loading && !cart) {
    return (
      <div className="mx-auto grid max-w-[1392px] gap-[69px] px-6 py-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] w-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-bg-muted">
          <ShoppingBag className="h-10 w-10 text-content-muted" />
        </div>
        <h1 className="text-32 font-bold text-content-strong">{tEmpty('title')}</h1>
        <p className="text-16 text-content-muted">{tEmpty('body')}</p>
        <Button asChild size="lg">
          <Link href="/products">{tEmpty('cta')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto grid max-w-[1392px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-[69px]">
        {/* Line items */}
        <section className="flex flex-col gap-8">
          <h1 className="text-right text-32 font-medium text-accent">{t('title')}</h1>
          <ul className="flex flex-col">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-5 border-b border-dashed border-hairline px-2.5 pb-4 pt-4"
              >
                {/* image (right in RTL) */}
                <div className="size-[100px] shrink-0 overflow-hidden rounded-[2px] bg-bg-muted">
                  {item.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  )}
                </div>

                {/* name + delete (middle) */}
                <div className="flex min-w-0 flex-1 flex-col items-end gap-4">
                  <Link
                    href={`/products/${item.productSlug ?? ''}`}
                    className="line-clamp-2 text-right font-dm text-20 font-medium text-accent hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-2 text-16 text-content-muted transition-colors hover:text-accent"
                  >
                    <span>{t('removeItem')}</span>
                    <Trash2 className="size-[18px]" strokeWidth={1.75} />
                  </button>
                </div>

                {/* price + quantity (left) */}
                <div className="flex w-[179px] shrink-0 flex-col items-center gap-4">
                  <span className="font-dm text-20 font-extrabold text-accent" dir="ltr">
                    {formatDzd(item.linePrice * 100)}
                  </span>
                  <div className="flex w-full items-center justify-center gap-4 rounded-lg border border-[#f9fafb] bg-white p-2 shadow-sm">
                    <button
                      type="button"
                      aria-label="-"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex size-5 items-center justify-center text-content-strong"
                    >
                      <Minus className="size-4" strokeWidth={1.75} />
                    </button>
                    <span className="flex-1 text-center text-14 text-content-strong">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="+"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex size-5 items-center justify-center text-content-strong"
                    >
                      <Plus className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order summary */}
        <aside className="flex h-fit flex-col gap-6">
          <h2 className="text-right text-32 font-medium text-accent">{tSummary('title')}</h2>
          <div className="flex items-center justify-between gap-4 text-20 font-medium text-accent">
            <span>{tSummary('totalCount', { count: cart.totalQuantity })}</span>
            <span className="font-dm">{formatDzdTotal(cart.total * 100, locale)}</span>
          </div>
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-16 font-medium text-content-inverse"
          >
            {tSummary('checkout')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
