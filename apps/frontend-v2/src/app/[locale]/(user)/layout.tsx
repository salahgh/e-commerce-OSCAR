'use client';

import * as React from 'react';
import { LogOut, Package, Heart, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { Header, Footer } from '@/components/layout';
import { Alert, Card, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/user/profile', key: 'profile' as const, icon: User },
  { href: '/user/orders', key: 'orders' as const, icon: Package },
  { href: '/user/wishlist', key: 'wishlist' as const, icon: Heart },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('UserLayout');
  const tNav = useTranslations('UserLayout.nav');
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6">
          <Alert intent="info">{t('loginRequired')}</Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-2">
          <h1 className="mb-2 text-18 font-bold text-content-strong">{t('title')}</h1>
          <nav aria-label={t('title')}>
            <ul className="flex flex-col gap-1">
              {items.map((it) => {
                const active = pathname.startsWith(it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={cn(
                        'flex items-center gap-3 rounded px-3 py-2 text-14 transition-colors',
                        active
                          ? 'bg-bg-subtle font-medium text-content-strong'
                          : 'text-content hover:bg-bg-subtle',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tNav(it.key)}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded px-3 py-2 text-start text-14 text-state-danger-content transition-colors hover:bg-bg-subtle"
                >
                  <LogOut className="h-4 w-4" />
                  {tNav('logout')}
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        <section>
          <Card padding="lg">{children}</Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
