'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl = '',
  onPageChange,
}: PaginationProps) {
  const searchParams = useSearchParams();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          asChild={!onPageChange}
          onClick={onPageChange ? () => onPageChange(currentPage - 1) : undefined}
        >
          {onPageChange ? (
            <button>
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <Link href={getPageUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
        </Button>
      )}

      {/* Page Numbers */}
      {generatePageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Button
            key={pageNum}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            asChild={!onPageChange && !isActive}
            disabled={isActive}
            onClick={onPageChange && !isActive ? () => onPageChange(pageNum) : undefined}
            className={cn('min-w-[2.5rem]', isActive && 'pointer-events-none')}
          >
            {onPageChange || isActive ? (
              <button>{pageNum}</button>
            ) : (
              <Link href={getPageUrl(pageNum)}>{pageNum}</Link>
            )}
          </Button>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          asChild={!onPageChange}
          onClick={onPageChange ? () => onPageChange(currentPage + 1) : undefined}
        >
          {onPageChange ? (
            <button>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link href={getPageUrl(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      )}
    </nav>
  );
}
