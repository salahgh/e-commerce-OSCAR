'use client';

import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@oscar/shared';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@/i18n/routing';
import { Alert, Button, Card, IconButton, QuantityStepper, Skeleton } from '@/components/ui';

export default function CartPage() {
  const t = useTranslations('CartPage');
  const tSummary = useTranslations('CartPage.summary');
  const tEmpty = useTranslations('CartPage.empty');
  const tPromo = useTranslations('CartPage.promo');
  const { cart, loading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();

  if (loading && !cart) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
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
          <Link href="/products">
            <span className="inline-flex items-center gap-2">
              <span>{tEmpty('cta')}</span>
              <ArrowRight className="h-5 w-5 ltr:inline rtl:hidden" />
              <ArrowLeft className="h-5 w-5 ltr:hidden rtl:inline" />
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Line items */}
      <section aria-labelledby="cart-title" className="flex flex-col gap-4">
        <h1 id="cart-title" className="text-32 font-bold text-content-strong">
          {t('titleWithCount', { count: cart.totalQuantity })}
        </h1>
        <ul className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <li key={item.id}>
              <Card padding="md" className="flex items-stretch gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-bg-muted">
                  {item.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      href={`/products/${item.productSlug ?? ''}`}
                      className="text-16 font-medium text-content-strong hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="break-words text-12 text-content-muted">{item.variantName} · {item.sku}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:gap-4 md:justify-end">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => updateQuantity(item.id, q)}
                      min={1}
                      max={99}
                      size="sm"
                    />
                    <span className="min-w-0 text-end text-16 font-bold text-content-strong sm:min-w-[6rem]">
                      {formatPrice(item.linePrice * 100, cart.currencyCode)}
                    </span>
                    <IconButton
                      aria-label={t('removeItemAria')}
                      intent="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-state-danger-content" />
                    </IconButton>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <aside className="sticky top-24 flex h-fit flex-col gap-4">
        <Card padding="lg" className="flex flex-col gap-4">
          <h2 className="text-24 font-bold text-content-strong">{tSummary('title')}</h2>

          <CouponField
            currentCodes={cart.couponCodes}
            onApply={applyCoupon}
            onRemove={removeCoupon}
            placeholder={tPromo('placeholder')}
            applyLabel={tPromo('apply')}
            removeLabel={tPromo('remove')}
          />

          <dl className="flex flex-col gap-2 border-t border-border pt-4 text-14">
            <Row
              label={tSummary('subtotal')}
              value={formatPrice(
                (cart.subTotal + cart.discounts.reduce((sum, d) => sum + Math.abs(d.amountWithTax), 0)) * 100,
                cart.currencyCode,
              )}
            />
            <Row
              label={tSummary('shipping')}
              value={cart.shipping > 0 ? formatPrice(cart.shipping * 100, cart.currencyCode) : tSummary('shippingTbd')}
            />
            {cart.discounts.map((d, i) => (
              <Row key={i} label={d.description} value={`- ${formatPrice(Math.abs(d.amountWithTax) * 100, cart.currencyCode)}`} />
            ))}
          </dl>
          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-16 font-medium text-content-strong">{tSummary('total')}</span>
            <span className="text-24 font-bold text-content-strong">
              {formatPrice(cart.total * 100, cart.currencyCode)}
            </span>
          </div>
          <Button asChild size="lg" fullWidth>
            <Link href="/checkout">
              <span className="inline-flex items-center gap-2">
                <span>{tSummary('checkout')}</span>
                <ArrowRight className="h-5 w-5 ltr:inline rtl:hidden" />
                <ArrowLeft className="h-5 w-5 ltr:hidden rtl:inline" />
              </span>
            </Link>
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-content-muted">{label}</dt>
      <dd className="font-medium text-content">{value}</dd>
    </div>
  );
}

function CouponField({
  currentCodes,
  onApply,
  onRemove,
  placeholder,
  applyLabel,
  removeLabel,
}: {
  currentCodes: string[];
  onApply: (code: string) => Promise<boolean>;
  onRemove: (code: string) => Promise<void>;
  placeholder: string;
  applyLabel: string;
  removeLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem('coupon') as HTMLInputElement;
          const code = input.value.trim();
          if (!code) return;
          const ok = await onApply(code);
          if (ok) input.value = '';
        }}
        className="flex gap-2"
      >
        <input
          name="coupon"
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded border border-border-input bg-bg-base px-3 text-14 focus:border-border-focus focus:outline-none"
        />
        <Button intent="secondary" type="submit">{applyLabel}</Button>
      </form>
      {currentCodes.map((code) => (
        <div key={code} className="flex items-center justify-between rounded bg-bg-subtle px-3 py-2 text-12">
          <span className="font-medium text-content-strong">{code}</span>
          <button
            type="button"
            onClick={() => onRemove(code)}
            className="text-state-danger-content hover:underline"
          >
            {removeLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
