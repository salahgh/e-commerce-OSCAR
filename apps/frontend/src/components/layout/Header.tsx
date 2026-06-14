'use client';

import { useTranslations } from 'next-intl';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { WishlistButton } from './WishlistButton';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CategoryNav } from './CategoryNav';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export function Header() {
  const t = useTranslations('Layout.header');
  const settings = useSiteSettings();
  const promo = settings?.promoText || t('promo');
  return (
    <header className="px-6 pt-6">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-4 rounded-[20px] border-[0.5px] border-border bg-bg-elevated px-4 py-4 shadow-sm sm:gap-5 sm:px-6 sm:py-5">
        {/* Free-shipping announcement */}
        <div className="flex items-center justify-center rounded-sm bg-accent px-4 py-3 text-center text-12 text-content-inverse sm:px-6 sm:py-4 sm:text-16">
          {promo}
        </div>

        {/*
          Logo · search · utilities.
          Mobile (Figma 477-11265): stacked — utilities row, then search + logo.
          Desktop: a single row [logo · search · utilities] via `md:contents`,
          which lifts the logo + search out of their mobile wrapper.
        */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Utilities — first on mobile, last on desktop */}
          <div className="flex items-center gap-4 sm:gap-6 md:order-last md:shrink-0">
            <WishlistButton />
            <span aria-hidden="true" className="h-9 w-px bg-border" />
            <CartButton />
            <LocaleSwitcher />
          </div>

          <div className="flex items-center gap-4 md:contents">
            <Logo size="md" className="shrink-0" />
            <SearchBar className="min-w-0 flex-1" />
          </div>
        </div>

        {/* Category sub-nav */}
        <CategoryNav />
      </div>
    </header>
  );
}
