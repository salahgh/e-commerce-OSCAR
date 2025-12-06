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
    default: 'bg-gray-700 text-gray-200',
    success: 'bg-green-900/50 text-green-400 ring-1 ring-green-500/30',
    warning: 'bg-yellow-900/50 text-yellow-400 ring-1 ring-yellow-500/30',
    danger: 'bg-red-900/50 text-red-400 ring-1 ring-red-500/30',
    info: 'bg-blue-900/50 text-blue-400 ring-1 ring-blue-500/30',
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
