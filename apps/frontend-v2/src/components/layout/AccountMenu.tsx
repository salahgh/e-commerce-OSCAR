'use client';

import * as React from 'react';
import { User, LogOut, Package, Heart, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

export function AccountMenu() {
  const { customer, isAuthenticated, logout, loading } = useAuth();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return <div className="h-10 w-10 animate-pulse rounded bg-bg-muted" aria-hidden="true" />;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center gap-2 rounded px-3 text-14 font-medium text-content transition-colors hover:bg-bg-subtle"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Se connecter</span>
      </Link>
    );
  }

  const initials = `${customer?.firstName?.[0] ?? ''}${customer?.lastName?.[0] ?? ''}`.toUpperCase() || 'OS';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded px-2 text-14 font-medium text-content transition-colors hover:bg-bg-subtle"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg-muted text-12 font-bold">
          {initials}
        </span>
        <span className="hidden sm:inline">{customer?.firstName}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 z-dropdown mt-2 w-56 rounded border border-border bg-bg-elevated p-1 shadow-overlay"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-14 font-medium text-content-strong">
              {customer?.firstName} {customer?.lastName}
            </p>
            <p className="truncate text-12 text-content-muted">{customer?.emailAddress}</p>
          </div>
          <MenuLink href="/user/profile" icon={<Settings className="h-4 w-4" />}>Mon profil</MenuLink>
          <MenuLink href="/user/orders" icon={<Package className="h-4 w-4" />}>Mes commandes</MenuLink>
          <MenuLink href="/user/wishlist" icon={<Heart className="h-4 w-4" />}>Mes favoris</MenuLink>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded px-3 py-2 text-start text-14 text-state-danger-content transition-colors hover:bg-bg-subtle',
            )}
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 rounded px-3 py-2 text-14 text-content transition-colors hover:bg-bg-subtle"
    >
      <span className="text-content-muted">{icon}</span>
      {children}
    </Link>
  );
}
