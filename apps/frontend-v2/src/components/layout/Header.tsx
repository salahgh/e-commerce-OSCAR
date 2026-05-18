import { Heart, Menu } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';
import { TopBar } from './TopBar';
import { MainNav } from './MainNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { AccountMenu } from './AccountMenu';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Header() {
  return (
    <header className="sticky top-0 z-overlay flex flex-col bg-bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-bg-base/80">
      <TopBar />
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <button
            type="button"
            className="-ms-2 inline-flex h-10 w-10 items-center justify-center rounded text-content lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <MainNav />

          <SearchBar className="hidden md:block flex-1 max-w-md" />

          <div className="ms-auto flex items-center gap-1">
            <LocaleSwitcher />
            <AccountMenu />
            <Link
              href="/user/wishlist"
              aria-label="Mes favoris"
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
