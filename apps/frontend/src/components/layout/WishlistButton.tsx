'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from '@/i18n/routing';

/** Inline wishlist indicator: count numeral next to the heart glyph (Figma header). */
export function WishlistButton() {
  const t = useTranslations('Layout.header');
  const { count } = useWishlist();
  return (
    <Link
      href="/user/wishlist"
      aria-label={t('wishlistAria')}
      className="inline-flex items-center gap-2 text-content-strong transition-opacity hover:opacity-70"
    >
      <Heart className="h-7 w-7" strokeWidth={1.5} />
      <span className="font-dm text-24 leading-none text-content-muted">{count}</span>
    </Link>
  );
}
