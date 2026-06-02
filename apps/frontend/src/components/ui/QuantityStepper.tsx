'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeMap = {
  sm: { wrap: 'h-8', btn: 'h-8 w-8', input: 'h-8 w-10 text-12' },
  md: { wrap: 'h-10', btn: 'h-10 w-10', input: 'h-10 w-12 text-14' },
} as const;

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'md',
  disabled,
  className,
  ariaLabel,
}: QuantityStepperProps) {
  const t = useTranslations('QuantityStepper');
  const sz = sizeMap[size];
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={cn('inline-flex items-center rounded border border-border-input bg-bg-base', sz.wrap, className)}
      role="group"
      aria-label={ariaLabel ?? t('label')}
    >
      <button
        type="button"
        aria-label={t('decrease')}
        onClick={dec}
        disabled={disabled || value <= min}
        className={cn('inline-flex items-center justify-center text-content transition-colors hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed', sz.btn)}
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className={cn(
          'border-0 bg-transparent text-center text-content focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          sz.input,
        )}
      />
      <button
        type="button"
        aria-label={t('increase')}
        onClick={inc}
        disabled={disabled || value >= max}
        className={cn('inline-flex items-center justify-center text-content transition-colors hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed', sz.btn)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
