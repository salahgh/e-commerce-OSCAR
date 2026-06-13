import { useTranslations } from 'next-intl';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { WishlistButton } from './WishlistButton';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CategoryNav } from './CategoryNav';

export function Header() {
  const t = useTranslations('Layout.header');
  return (
    <header className="px-6 pt-6">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-5 rounded-[20px] border-[0.5px] border-border bg-bg-elevated px-6 py-5 shadow-sm">
        {/* Free-shipping announcement */}
        <div className="flex items-center justify-center rounded-sm bg-accent px-6 py-4 text-center text-16 text-content-inverse">
          {t('promo')}
        </div>

        {/* Logo · search · utilities */}
        <div className="flex items-center gap-6">
          <Logo size="md" className="shrink-0" />
          <SearchBar className="min-w-0 flex-1" />
          <div className="flex shrink-0 items-center gap-6">
            <WishlistButton />
            <span aria-hidden="true" className="h-9 w-px bg-border" />
            <CartButton />
            <LocaleSwitcher />
          </div>
        </div>

        {/* Category sub-nav */}
        <CategoryNav />
      </div>
    </header>
  );
}
