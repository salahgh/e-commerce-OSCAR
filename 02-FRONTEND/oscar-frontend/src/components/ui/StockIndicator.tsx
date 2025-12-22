'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/index';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface StockIndicatorProps {
  quantity: number;
  lowStockThreshold?: number;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StockIndicator = React.forwardRef<HTMLDivElement, StockIndicatorProps>(
  (
    {
      quantity,
      lowStockThreshold = 5,
      showQuantity = true,
      size = 'md',
      className,
    },
    ref
  ) => {
    const isOutOfStock = quantity <= 0;
    const isLowStock = quantity > 0 && quantity <= lowStockThreshold;
    const isInStock = quantity > lowStockThreshold;

    const sizeClasses = {
      sm: {
        container: 'text-xs',
        dot: 'h-1.5 w-1.5',
        icon: 'h-3 w-3',
      },
      md: {
        container: 'text-sm',
        dot: 'h-2 w-2',
        icon: 'h-4 w-4',
      },
      lg: {
        container: 'text-base',
        dot: 'h-2.5 w-2.5',
        icon: 'h-5 w-5',
      },
    };

    const classes = sizeClasses[size];

    if (isOutOfStock) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-2 text-destructive',
            classes.container,
            className
          )}
        >
          <XCircle className={classes.icon} />
          <span className="font-medium">Rupture de stock</span>
        </div>
      );
    }

    if (isLowStock) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-2 text-orange-600 dark:text-orange-400',
            classes.container,
            className
          )}
        >
          <AlertTriangle className={classes.icon} />
          <span className="font-medium">
            Stock faible{showQuantity && ` (${quantity} restants)`}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 text-green-600 dark:text-green-400',
          classes.container,
          className
        )}
      >
        <CheckCircle className={classes.icon} />
        <span className="font-medium">
          En stock{showQuantity && ` (${quantity} disponibles)`}
        </span>
      </div>
    );
  }
);

StockIndicator.displayName = 'StockIndicator';

// Simple dot-based stock indicator
interface StockDotProps {
  quantity: number;
  lowStockThreshold?: number;
  className?: string;
}

const StockDot = React.forwardRef<HTMLDivElement, StockDotProps>(
  ({ quantity, lowStockThreshold = 5, className }, ref) => {
    const isOutOfStock = quantity <= 0;
    const isLowStock = quantity > 0 && quantity <= lowStockThreshold;

    return (
      <div
        ref={ref}
        className={cn(
          'h-2 w-2 rounded-full',
          isOutOfStock && 'bg-destructive',
          isLowStock && 'bg-orange-500',
          !isOutOfStock && !isLowStock && 'bg-green-500',
          className
        )}
        title={
          isOutOfStock
            ? 'Out of stock'
            : isLowStock
            ? `Low stock (${quantity})`
            : `In stock (${quantity})`
        }
      />
    );
  }
);

StockDot.displayName = 'StockDot';

export { StockIndicator, StockDot };
