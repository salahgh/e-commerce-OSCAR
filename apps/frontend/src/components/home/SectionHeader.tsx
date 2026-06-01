'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
}

export function SectionHeader({ title, href }: SectionHeaderProps) {
  const t = useTranslations('home');
  const dir = typeof document !== 'undefined' ? document.documentElement.dir : 'ltr';

  return (
    <div className="flex items-center justify-between px-6 mb-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {t('seeAll')}
          {dir === 'rtl' ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Link>
      )}
    </div>
  );
}
