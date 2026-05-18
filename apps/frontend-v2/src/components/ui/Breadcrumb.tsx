import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Crumb {
  label: React.ReactNode;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: Crumb[];
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, className, separator, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn('flex items-center gap-2 text-14', className)} {...props}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.href && !isLast ? (
              <a href={item.href} className="text-content-muted transition-colors hover:text-content-strong">
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-content-strong font-medium' : 'text-content-muted'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden="true" className="text-content-subtle">
                {separator ?? (
                  <>
                    <ChevronRight className="h-4 w-4 ltr:inline rtl:hidden" />
                    <ChevronLeft className="h-4 w-4 ltr:hidden rtl:inline" />
                  </>
                )}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
