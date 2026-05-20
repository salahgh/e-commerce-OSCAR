'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const tagVariants = cva(
  'inline-flex items-center gap-2 rounded border bg-bg-base font-medium transition-colors duration-fast',
  {
    variants: {
      intent: {
        default: 'bg-bg-subtle border-content-muted text-content-strong',
        info: 'bg-state-info-bg border-state-info-border text-state-info-content',
        warning: 'bg-state-warning-bg border-state-warning-border text-state-warning-content',
        success: 'bg-state-success-bg border-state-success-border text-state-success-content',
        danger: 'bg-state-danger-bg border-state-danger-border text-state-danger-content',
        dark: 'bg-content-muted border-accent text-content-inverse',
      },
      size: {
        sm: 'px-2 py-1 text-12 [&_svg]:h-4 [&_svg]:w-4',
        md: 'px-2 py-2 text-14 [&_svg]:h-6 [&_svg]:w-6',
      },
    },
    defaultVariants: { intent: 'default', size: 'md' },
  },
);

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof tagVariants> {
  leadingIcon?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  children: React.ReactNode;
}

export function Tag({ className, intent, size, leadingIcon, onClose, closeLabel, children, ...props }: TagProps) {
  const t = useTranslations('Common');
  return (
    <span className={cn(tagVariants({ intent, size }), className)} {...props}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel ?? t('remove')}
          className="-mx-1 inline-flex items-center justify-center rounded hover:bg-bg-muted/40"
        >
          <X />
        </button>
      )}
      <span>{children}</span>
      {leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
    </span>
  );
}
