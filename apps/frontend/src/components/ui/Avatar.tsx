import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-8 w-8 text-12', md: 'h-10 w-10 text-14', lg: 'h-12 w-12 text-16' } as const;

export function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const initials = fallback?.slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-muted font-medium text-content-strong',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
