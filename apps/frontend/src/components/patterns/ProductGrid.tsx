import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5;
}

const columnMap: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

export function ProductGrid({ children, className, columns = 4 }: ProductGridProps) {
  return <div className={cn('grid gap-4', columnMap[columns], className)}>{children}</div>;
}
