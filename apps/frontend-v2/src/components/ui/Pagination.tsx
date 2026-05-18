'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function pageList(page: number, count: number): Array<number | 'gap'> {
  if (count <= 7) return range(1, count);
  if (page <= 4) return [...range(1, 5), 'gap', count];
  if (page >= count - 3) return [1, 'gap', ...range(count - 4, count)];
  return [1, 'gap', page - 1, page, page + 1, 'gap', count];
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const items = pageList(page, pageCount);
  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      <Button
        intent="ghost"
        size="icon-md"
        aria-label="Précédent"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 ltr:block rtl:hidden" />
        <ChevronRight className="h-4 w-4 ltr:hidden rtl:block" />
      </Button>
      {items.map((it, i) =>
        it === 'gap' ? (
          <span key={`gap-${i}`} className="px-2 text-content-muted">
            …
          </span>
        ) : (
          <Button
            key={it}
            intent={it === page ? 'primary' : 'ghost'}
            size="icon-md"
            aria-current={it === page ? 'page' : undefined}
            onClick={() => onPageChange(it)}
          >
            {it}
          </Button>
        ),
      )}
      <Button
        intent="ghost"
        size="icon-md"
        aria-label="Suivant"
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4 ltr:block rtl:hidden" />
        <ChevronLeft className="h-4 w-4 ltr:hidden rtl:block" />
      </Button>
    </nav>
  );
}
