'use client';

import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';

/** Inline cart indicator: count numeral next to the cart glyph (Figma header). */
export function CartButton() {
  const t = useTranslations('Layout.header');
  const { itemCount, openMiniCart } = useCart();
  return (
    <button
      type="button"
      onClick={openMiniCart}
      aria-label={t('cartAria', { count: itemCount })}
      className="inline-flex items-center gap-2 text-content-strong transition-opacity hover:opacity-70"
    >
      <ShoppingCart className="h-7 w-7" strokeWidth={1.5} />
      <span className="font-dm text-24 leading-none text-content-muted">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </button>
  );
}
