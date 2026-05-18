'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui';

export function CartButton() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Panier (${itemCount} articles)`}
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
    </Link>
  );
}
