'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SizeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  outOfStock?: boolean;
}

export const SizeButton = React.forwardRef<HTMLButtonElement, SizeButtonProps>(
  ({ selected, outOfStock, className, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || outOfStock;
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        disabled={isDisabled}
        className={cn(
          'inline-flex h-10 min-w-12 items-center justify-center rounded border px-3 text-14 font-medium transition-colors duration-fast',
          selected && !isDisabled && 'border-accent bg-accent text-accent-content',
          !selected && !isDisabled && 'border-border-strong bg-bg-base text-content hover:border-content-strong',
          outOfStock && 'border-border bg-bg-subtle text-content-subtle line-through cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
SizeButton.displayName = 'SizeButton';

interface SizeButtonGroupProps {
  options: Array<{ value: string; label: string; outOfStock?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function SizeButtonGroup({ options, value, onValueChange, className }: SizeButtonGroupProps) {
  return (
    <div role="radiogroup" className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <SizeButton
          key={opt.value}
          selected={value === opt.value}
          outOfStock={opt.outOfStock}
          onClick={() => onValueChange?.(opt.value)}
        >
          {opt.label}
        </SizeButton>
      ))}
    </div>
  );
}
