'use client';

import { ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@oscar/shared';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@/i18n/routing';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  IconButton,
  QuantityStepper,
} from '@/components/ui';

export function MiniCart() {
  const t = useTranslations('MiniCart');
  const tCart = useTranslations('CartPage');
  const { cart, isMiniCartOpen, closeMiniCart, updateQuantity, removeItem } = useCart();

  return (
    <Drawer open={isMiniCartOpen} onOpenChange={(open) => !open && closeMiniCart()}>
      <DrawerContent className="flex flex-col gap-0 p-0">
        <header className="flex items-center justify-between border-b border-border p-4">
          <DrawerTitle className="text-16 font-bold text-content-strong">
            {t('title')}
            {cart && cart.totalQuantity > 0 && (
              <span className="ms-2 text-12 font-normal text-content-muted">
                ({cart.totalQuantity})
              </span>
            )}
          </DrawerTitle>
        </header>

        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-muted">
              <ShoppingBag className="h-8 w-8 text-content-muted" />
            </div>
            <p className="text-14 text-content-muted">{t('empty')}</p>
            <DrawerClose asChild>
              <Button asChild>
                <Link href="/products">{t('browse')}</Link>
              </Button>
            </DrawerClose>
          </div>
        ) : (
          <>
            <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded border border-border bg-bg-base p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-bg-muted">
                    {item.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <DrawerClose asChild>
                      <Link
                        href={`/products/${item.productSlug ?? ''}`}
                        className="text-14 font-medium text-content-strong hover:underline"
                      >
                        {item.productName}
                      </Link>
                    </DrawerClose>
                    <p className="text-12 text-content-muted">{item.variantName}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.id, q)}
                        min={1}
                        max={99}
                        size="sm"
                      />
                      <span className="text-14 font-bold text-content-strong">
                        {formatPrice(item.linePrice * 100, cart.currencyCode)}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    aria-label={tCart('removeItemAria')}
                    intent="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-state-danger-content" />
                  </IconButton>
                </li>
              ))}
            </ul>

            <footer className="flex flex-col gap-3 border-t border-border p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-14 text-content-muted">{t('subtotal')}</span>
                <span className="text-18 font-bold text-content-strong">
                  {formatPrice(cart.subTotal * 100, cart.currencyCode)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <DrawerClose asChild>
                  <Button asChild fullWidth>
                    <Link href="/checkout">{t('checkout')}</Link>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button asChild intent="secondary" fullWidth>
                    <Link href="/cart">{t('viewCart')}</Link>
                  </Button>
                </DrawerClose>
              </div>
            </footer>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
