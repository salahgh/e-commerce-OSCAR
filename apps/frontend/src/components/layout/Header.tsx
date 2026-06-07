import { Heart, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';
import { TopBar } from './TopBar';
import { MainNav } from './MainNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { AccountMenu } from './AccountMenu';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const t = useTranslations('Layout.header');
  return (
    <header className="sticky top-0 z-overlay flex flex-col bg-bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-bg-base/80">
      <TopBar />
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:gap-6">
          <button
            type="button"
            className="-ms-2 inline-flex h-10 w-10 items-center justify-center rounded text-content lg:hidden"
            aria-label={t('openMenu')}
          >
            <Menu className="h-6 w-6" />
          </button>

          <MainNav />

          <SearchBar className="hidden min-w-0 flex-1 max-w-md md:block" />

          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <LocaleSwitcher />
            <AccountMenu />
            <Link
              href="/user/wishlist"
              aria-label={t('wishlistAria')}
              className="inline-flex h-10 w-10 items-center justify-center rounded text-content transition-colors hover:bg-bg-subtle"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <CartButton />
          </div>

          <Logo size="md" />
        </div>
      </div>
    </header>
  );
}
