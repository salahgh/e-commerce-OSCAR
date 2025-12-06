import { useState, useCallback, useMemo } from 'react';

export interface ProductFilters {
  search: string;
  enabled: boolean | undefined;
  isFeatured: boolean | undefined;
  categoryIds: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sizes: string[];
  colors: string[];
  stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
}

const defaultFilters: ProductFilters = {
  search: '',
  enabled: undefined,
  isFeatured: undefined,
  categoryIds: [],
  minPrice: undefined,
  maxPrice: undefined,
  sizes: [],
  colors: [],
  stockStatus: 'all',
};

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const updateFilter = useCallback(<K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clearFilter = useCallback(<K extends keyof ProductFilters>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: defaultFilters[key] }));
  }, []);

  // Count active filters (excluding search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.enabled !== undefined) count++;
    if (filters.isFeatured !== undefined) count++;
    if (filters.categoryIds.length > 0) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.stockStatus !== 'all') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0 || filters.search !== '';

  // Build GraphQL filter object
  const buildGraphQLFilter = useCallback(() => {
    const filter: Record<string, unknown> = {};

    if (filters.search) {
      filter.name = { contains: filters.search };
    }

    if (filters.enabled !== undefined) {
      filter.enabled = { eq: filters.enabled };
    }

    // Note: Vendure Admin API filter structure
    // customFields filters may need special handling depending on Vendure version

    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    clearFilter,
    activeFilterCount,
    hasActiveFilters,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    buildGraphQLFilter,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
