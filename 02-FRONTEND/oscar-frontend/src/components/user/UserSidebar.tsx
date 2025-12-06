'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Settings, LogOut, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function UserSidebar() {
  const pathname = usePathname();
  const { customer, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      href: '/user/profile',
      label: 'Mon Profil',
      icon: <User className="h-5 w-5" />,
    },
    {
      href: '/user/orders',
      label: 'Mes Commandes',
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: '/user/wishlist',
      label: 'Ma Liste de Souhaits',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      href: '/user/settings',
      label: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => {
    return pathname?.includes(href);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* User Info */}
      {customer && (
        <div className="pb-4 mb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">{customer.emailAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-primary text-white'
                : 'text-foreground hover:bg-muted'
            )}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-error hover:bg-error/10 hover:text-error"
          leftIcon={<LogOut className="h-5 w-5" />}
          onClick={logout}
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
