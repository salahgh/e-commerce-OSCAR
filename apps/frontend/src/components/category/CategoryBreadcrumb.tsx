'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
}

interface CategoryBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
  locale: string;
  className?: string;
  showHome?: boolean;
}

export default function CategoryBreadcrumb({
  breadcrumbs,
  locale,
  className,
  showHome = true,
}: CategoryBreadcrumbProps) {
  // Filter out the root breadcrumb (usually has id "1" or slug "__root__")
  const filteredBreadcrumbs = breadcrumbs.filter(
    (crumb) => crumb.slug !== '__root_collection__' && crumb.id !== '1'
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href={`/${locale}`}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Accueil</span>
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
          </li>
        )}

        <li className="flex items-center">
          <Link
            href={`/${locale}/categories`}
            className="hover:text-foreground transition-colors"
          >
            Catégories
          </Link>
          {filteredBreadcrumbs.length > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
        </li>

        {filteredBreadcrumbs.map((crumb, index) => {
          const isLast = index === filteredBreadcrumbs.length - 1;

          return (
            <li key={crumb.id} className="flex items-center">
              {isLast ? (
                <span className="font-medium text-foreground">{crumb.name}</span>
              ) : (
                <>
                  <Link
                    href={`/${locale}/categories/${crumb.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.name}
                  </Link>
                  <ChevronRight className="h-4 w-4 mx-1" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
