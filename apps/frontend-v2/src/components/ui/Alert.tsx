'use client';

import * as React from 'react';
import { Info, AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const alertVariants = cva('flex items-start gap-4 rounded border p-4 transition-colors duration-fast', {
  variants: {
    intent: {
      info: 'bg-state-info-bg border-state-info-border',
      success: 'bg-state-success-bg border-state-success-border',
      warning: 'bg-state-warning-bg border-state-warning-border',
      danger: 'bg-state-danger-bg border-state-danger-border',
    },
  },
  defaultVariants: { intent: 'info' },
});

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
} as const;

const iconColor = {
  info: 'text-state-info-border',
  success: 'text-state-success-border',
  warning: 'text-state-warning-border',
  danger: 'text-state-danger-border',
} as const;

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ className, intent = 'info', title, children, onClose, ...props }: AlertProps) {
  const t = useTranslations('Common');
  const Icon = iconMap[intent ?? 'info'];
  return (
    <div role="alert" className={cn(alertVariants({ intent }), className)} {...props}>
      <Icon aria-hidden="true" className={cn('h-6 w-6 shrink-0', iconColor[intent ?? 'info'])} />
      <div className="flex flex-1 flex-col gap-2">
        {title && <p className="text-16 font-bold text-content-strong leading-tight">{title}</p>}
        {children && <div className="text-14 text-content">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="-m-1 inline-flex h-6 w-6 items-center justify-center rounded text-content-muted hover:bg-bg-muted/40"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
