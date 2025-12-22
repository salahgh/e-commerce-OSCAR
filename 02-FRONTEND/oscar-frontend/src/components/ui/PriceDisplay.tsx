'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/index';
import { formatPrice } from '@/lib/utils/formatters';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  className?: string;
}

const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  (
    {
      price,
      originalPrice,
      size = 'md',
      showDiscount = true,
      className,
    },
    ref
  ) => {
    const hasDiscount = originalPrice && originalPrice > price;
    const discountPercent = hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const sizeClasses = {
      sm: {
        current: 'text-sm font-semibold',
        original: 'text-xs',
        badge: 'text-xs px-1.5 py-0.5',
      },
      md: {
        current: 'text-lg font-bold',
        original: 'text-sm',
        badge: 'text-xs px-2 py-0.5',
      },
      lg: {
        current: 'text-2xl font-bold',
        original: 'text-base',
        badge: 'text-sm px-2 py-1',
      },
      xl: {
        current: 'text-3xl font-bold',
        original: 'text-lg',
        badge: 'text-sm px-2.5 py-1',
      },
    };

    const classes = sizeClasses[size];

    return (
      <div ref={ref} className={cn('flex items-center gap-2 flex-wrap', className)}>
        <span className={cn(classes.current, 'text-primary')}>
          {formatPrice(price)}
        </span>

        {hasDiscount && (
          <>
            <span
              className={cn(
                classes.original,
                'text-muted-foreground line-through'
              )}
            >
              {formatPrice(originalPrice)}
            </span>

            {showDiscount && (
              <span
                className={cn(
                  classes.badge,
                  'bg-destructive text-destructive-foreground rounded-md font-medium'
                )}
              >
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>
    );
  }
);

PriceDisplay.displayName = 'PriceDisplay';

export { PriceDisplay };
