'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { localeNames, locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils/cn';

export function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) ?? 'fr';
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded px-3 text-14 font-medium text-content transition-colors hover:bg-bg-subtle"
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-dropdown mt-2 min-w-[160px] rounded border border-border bg-bg-elevated p-1 shadow-overlay"
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === currentLocale}
                onClick={() => {
                  router.replace(pathname, { locale });
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-start text-14 transition-colors hover:bg-bg-subtle',
                  locale === currentLocale && 'font-medium text-content-strong',
                )}
              >
                {localeNames[locale]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
