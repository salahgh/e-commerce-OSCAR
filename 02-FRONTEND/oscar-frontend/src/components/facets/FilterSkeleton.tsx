'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterSkeletonProps {
  className?: string;
}

export function FilterSkeleton({ className }: FilterSkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-lg border border-gray-100 p-5', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Facet Sections */}
      <div className="space-y-6">
        {/* Price Range Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Color Swatch Skeleton */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-2 w-10 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Size Buttons Skeleton */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Checkbox List Skeleton */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-8 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Image */}
          <div className="aspect-square bg-gray-200 animate-pulse" />

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
