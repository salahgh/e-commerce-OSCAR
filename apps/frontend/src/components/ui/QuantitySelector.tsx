'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/index';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QuantitySelector = React.forwardRef<HTMLDivElement, QuantitySelectorProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 99,
      disabled = false,
      size = 'md',
      className,
    },
    ref
  ) => {
    const handleDecrement = () => {
      if (value > min && !disabled) {
        onChange(value - 1);
      }
    };

    const handleIncrement = () => {
      if (value < max && !disabled) {
        onChange(value + 1);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    const sizeClasses = {
      sm: {
        button: 'w-7 h-7',
        icon: 'h-3 w-3',
        input: 'w-8 text-sm',
      },
      md: {
        button: 'w-9 h-9',
        icon: 'h-4 w-4',
        input: 'w-10 text-base',
      },
      lg: {
        button: 'w-11 h-11',
        icon: 'h-5 w-5',
        input: 'w-14 text-lg',
      },
    };

    const classes = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            'flex items-center justify-center rounded-md border border-input',
            'hover:border-primary hover:bg-accent transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-input disabled:hover:bg-transparent',
            classes.button
          )}
          aria-label="Decrease quantity"
        >
          <Minus className={classes.icon} />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'text-center font-medium bg-transparent border-none outline-none',
            'appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            'disabled:opacity-50',
            classes.input
          )}
          aria-label="Quantity"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(
            'flex items-center justify-center rounded-md border border-input',
            'hover:border-primary hover:bg-accent transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-input disabled:hover:bg-transparent',
            classes.button
          )}
          aria-label="Increase quantity"
        >
          <Plus className={classes.icon} />
        </button>
      </div>
    );
  }
);

QuantitySelector.displayName = 'QuantitySelector';

export { QuantitySelector };
