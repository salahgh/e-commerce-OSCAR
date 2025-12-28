import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success/20 text-success ring-1 ring-success/30',
    warning: 'bg-warning/20 text-warning ring-1 ring-warning/30',
    danger: 'bg-destructive/20 text-destructive ring-1 ring-destructive/30',
    info: 'bg-primary/20 text-primary ring-1 ring-primary/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
