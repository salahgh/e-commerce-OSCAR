'use client';

import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui';

export function CartButton() {
  const t = useTranslations('Layout.header');
  const { itemCount, openMiniCart } = useCart();
  return (
    <button
      type="button"
      onClick={openMiniCart}
      aria-label={t('cartAria', { count: itemCount })}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded text-content transition-colors hover:bg-bg-subtle"
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          intent="accent"
          className="absolute -top-1 -end-1 h-5 min-w-5 justify-center px-1"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </button>
  );
}
