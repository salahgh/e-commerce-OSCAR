import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@oscar/shared';

interface PriceDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Price in minor units (cents). */
  amount: number;
  /** Optional original/strike-through price in minor units, for sale display. */
  originalAmount?: number;
  currencyCode?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'text-14',
  md: 'text-16',
  lg: 'text-18',
  xl: 'text-24',
} as const;

export function PriceDisplay({
  amount,
  originalAmount,
  currencyCode = 'DZD',
  size = 'md',
  className,
  ...props
}: PriceDisplayProps) {
  const isOnSale = originalAmount && originalAmount > amount;
  return (
    <span className={cn('inline-flex items-baseline gap-2 font-bold text-content-strong', sizeMap[size], className)} {...props}>
      {isOnSale && (
        <span className="text-content-muted font-medium line-through text-[0.75em]">
          {formatPrice(originalAmount!, currencyCode)}
        </span>
      )}
      <span>{formatPrice(amount, currencyCode)}</span>
    </span>
  );
}
