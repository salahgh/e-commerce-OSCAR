'use client';

import { useTranslations } from 'next-intl';
import { CategoryCircles } from '@/components/patterns';
import { cn } from '@/lib/utils/cn';

/**
 * Top-level category circles shown beneath the header search row. Backend-driven
 * (top-level collections), rendered through the shared CategoryCircles component.
 */
export function CategoryNav({ className }: { className?: string }) {
  const t = useTranslations('Layout.categoryNav');
  return (
    <nav aria-label={t('ariaLabel')} className={cn('w-full', className)}>
      <CategoryCircles source="roots" size={64} align="center" limit={8} />
    </nav>
  );
}
