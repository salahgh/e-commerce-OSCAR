'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: string;
  page?: number;
}

export interface UseProductSearchReturn {
  searchTerm: string;
  category: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sizes: string[];
  colors: string[];
  sort: string;
  page: number;
  updateFilters: (updates: Partial<SearchFilters>) => void;
  setSearchTerm: (term: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useProductSearch(): UseProductSearchReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Parse current params
  const searchTerm = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || '';
  const minPrice = searchParams?.get('minPrice')
    ? parseInt(searchParams.get('minPrice')!, 10)
    : undefined;
  const maxPrice = searchParams?.get('maxPrice')
    ? parseInt(searchParams.get('maxPrice')!, 10)
    : undefined;
  const sizes = searchParams?.get('sizes')?.split(',').filter(Boolean) || [];
  const colors = searchParams?.get('colors')?.split(',').filter(Boolean) || [];
  const sort = searchParams?.get('sort') || 'name-asc';
  const page = parseInt(searchParams?.get('page') || '1', 10);

  // Calculate active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      category ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      sizes.length > 0 ||
      colors.length > 0
    );
  }, [searchTerm, category, minPrice, maxPrice, sizes, colors]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (category) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    count += sizes.length;
    count += colors.length;
    return count;
  }, [searchTerm, category, minPrice, maxPrice, sizes, colors]);

  // Update URL params
  const updateParams = useCallback(
    (updates: Partial<SearchFilters>) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page to 1 when filters change (unless page itself is being updated)
      if (!('page' in updates) && Object.keys(updates).some((k) => k !== 'sort')) {
        params.set('page', '1');
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const updateFilters = useCallback(
    (updates: Partial<SearchFilters>) => {
      updateParams(updates);
    },
    [updateParams]
  );

  const setSearchTerm = useCallback(
    (term: string) => {
      updateParams({ q: term || undefined });
    },
    [updateParams]
  );

  const setCategory = useCallback(
    (cat: string) => {
      updateParams({ category: cat || undefined });
    },
    [updateParams]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      updateParams({
        minPrice: min,
        maxPrice: max,
      });
    },
    [updateParams]
  );

  const toggleSize = useCallback(
    (size: string) => {
      const newSizes = sizes.includes(size)
        ? sizes.filter((s) => s !== size)
        : [...sizes, size];
      updateParams({ sizes: newSizes.length > 0 ? newSizes : undefined });
    },
    [sizes, updateParams]
  );

  const toggleColor = useCallback(
    (color: string) => {
      const newColors = colors.includes(color)
        ? colors.filter((c) => c !== color)
        : [...colors, color];
      updateParams({ colors: newColors.length > 0 ? newColors : undefined });
    },
    [colors, updateParams]
  );

  const setSort = useCallback(
    (newSort: string) => {
      updateParams({ sort: newSort });
    },
    [updateParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    router.push(`/${locale}/products`, { scroll: false });
  }, [router, locale]);

  return {
    searchTerm,
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    sort,
    page,
    updateFilters,
    setSearchTerm,
    setCategory,
    setPriceRange,
    toggleSize,
    toggleColor,
    setSort,
    setPage,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

export default useProductSearch;
