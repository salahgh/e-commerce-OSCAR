import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padMap = { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded border border-border bg-bg-elevated shadow-card transition-shadow duration-fast',
        padMap[padding],
        interactive && 'cursor-pointer hover:shadow-elevated',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-18 font-bold text-content-strong', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-14 text-content-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between gap-4 pt-2', className)} {...props} />;
}
