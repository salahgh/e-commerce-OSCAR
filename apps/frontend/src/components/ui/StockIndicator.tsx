'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface StockIndicatorProps {
  stock: number | null;
  threshold?: number;
  className?: string;
}

export function StockIndicator({ stock, threshold = 5, className }: StockIndicatorProps) {
  const t = useTranslations('StockIndicator');
  if (stock === null) return null;
  if (stock === 0) {
    return (
      <span className={cn('inline-flex items-center gap-2 text-12 text-state-danger-content', className)}>
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-state-danger-border" />
        {t('outOfStock')}
      </span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className={cn('inline-flex items-center gap-2 text-12 text-state-warning-content', className)}>
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-state-warning-border" />
        {t('lowStock', { count: stock })}
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-2 text-12 text-state-success-content', className)}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-state-success-border" />
      {t('inStock')}
    </span>
  );
}
