import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 text-12 font-medium leading-none h-5',
  {
    variants: {
      intent: {
        neutral: 'bg-bg-muted text-content-strong',
        accent: 'bg-accent text-accent-content',
        info: 'bg-state-info-bg text-state-info-content',
        success: 'bg-state-success-bg text-state-success-content',
        warning: 'bg-state-warning-bg text-state-warning-content',
        danger: 'bg-state-danger-bg text-state-danger-content',
      },
    },
    defaultVariants: { intent: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, intent, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ intent }), className)} {...props} />;
}
