/**
 * Unified Search Hook for Product List
 *
 * This hook provides a unified search experience for both Basic and Advanced filter modes.
 * It uses Vendure's Search API for server-side filtering which supports:
 * - Full-text search (searches product name AND SKU)
 * - Faceted filtering (with proper AND/OR logic)
 * - Collection filtering
 * - Stock availability filtering
 * - Sorting by name or price
 * - Server-side pagination
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  AdminSearchProductsDocument,
  AdminFacetsWithValuesDocument,
  AdminCollectionsDocument,
  type SearchInput,
  type FacetValueFilterInput,
  SortOrder,
} from '../graphql/generated/graphql';
import { useDebounce } from './useDebounce';
import {
  type FacetGroup,
  detectFacetType,
  buildFacetValueFilters,
  sortSizes,
} from '../lib/facet-utils';

// ============================================================================
// Types
// ============================================================================

export type StockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
export type SortByField = 'name' | 'price' | 'createdAt';

export interface UnifiedSearchState {
  // Search
  term: string;

  // Filters
  facetValueIds: string[];
  collectionId?: string;
  enabled?: boolean;
  isFeatured?: boolean;
  stockStatus: StockStatus;
  priceMin?: number;
  priceMax?: number;

  // Sorting
  sortBy: SortByField;
  sortOrder: 'ASC' | 'DESC';

  // Pagination
  page: number;
  perPage: number;
}

export interface FacetValueWithCount {
  id: string;
  name: string;
  code: string;
  count: number;
  facet: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CollectionWithCount {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface SearchResultItem {
  productId: string;
  productName: string;
  productVariantId: string;
  productVariantName: string;
  sku: string;
  slug: string;
  description: string;
  enabled: boolean;
  inStock: boolean;
  score: number;
  productAsset?: {
    id: string;
    preview: string;
  } | null;
  price: number | { min: number; max: number };
  priceWithTax: number | { min: number; max: number };
  currencyCode: string;
  collectionIds: string[];
  facetIds: string[];
  facetValueIds: string[];
}

export interface UseUnifiedSearchReturn {
  // State
  state: UnifiedSearchState;

  // Search Results
  results: SearchResultItem[];
  totalItems: number;
  loading: boolean;
  error: Error | null;

  // Facet Data (for filter UI)
  facetGroups: FacetGroup[];
  facetValueCounts: Map<string, number>;
  collections: CollectionWithCount[];
  facetsLoading: boolean;
  collectionsLoading: boolean;

  // Actions - Search
  setTerm: (term: string) => void;

  // Actions - Filters
  toggleFacetValue: (id: string) => void;
  setFacetValues: (ids: string[]) => void;
  clearFacetGroup: (facetId: string) => void;
  setCollectionId: (id?: string) => void;
  setEnabled: (enabled?: boolean) => void;
  setFeatured: (featured?: boolean) => void;
  setStockStatus: (status: StockStatus) => void;
  setPriceRange: (min?: number, max?: number) => void;

  // Actions - Sorting
  setSorting: (sortBy: SortByField, sortOrder: 'ASC' | 'DESC') => void;

  // Actions - Pagination
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Actions - Reset
  clearAllFilters: () => void;

  // Helpers
  activeFilterCount: number;
  isFilterActive: (facetValueId: string) => boolean;
}

// ============================================================================
// Default State
// ============================================================================

const getDefaultState = (): UnifiedSearchState => ({
  term: '',
  facetValueIds: [],
  collectionId: undefined,
  enabled: undefined,
  isFeatured: undefined,
  stockStatus: 'all',
  priceMin: undefined,
  priceMax: undefined,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  page: 1,
  perPage: 20,
});

// ============================================================================
// URL State Parsing/Serialization
// ============================================================================

function parseUrlState(searchParams: URLSearchParams): Partial<UnifiedSearchState> {
  const state: Partial<UnifiedSearchState> = {};

  const term = searchParams.get('q');
  if (term) state.term = term;

  // Parse facet values from f_* params
  const facetValueIds: string[] = [];
  searchParams.forEach((value, key) => {
    if (key.startsWith('f_')) {
      facetValueIds.push(...value.split(',').filter(Boolean));
    }
  });
  if (facetValueIds.length > 0) state.facetValueIds = facetValueIds;

  const collection = searchParams.get('collection');
  if (collection) state.collectionId = collection;

  const enabled = searchParams.get('enabled');
  if (enabled === 'true') state.enabled = true;
  if (enabled === 'false') state.enabled = false;

  const featured = searchParams.get('featured');
  if (featured === 'true') state.isFeatured = true;

  const stock = searchParams.get('stock') as StockStatus | null;
  if (stock && ['in_stock', 'low_stock', 'out_of_stock', 'all'].includes(stock)) {
    state.stockStatus = stock;
  }

  const priceMin = searchParams.get('price_min');
  if (priceMin) state.priceMin = parseInt(priceMin, 10);

  const priceMax = searchParams.get('price_max');
  if (priceMax) state.priceMax = parseInt(priceMax, 10);

  const sortBy = searchParams.get('sortBy') as SortByField | null;
  if (sortBy && ['name', 'price', 'createdAt'].includes(sortBy)) {
    state.sortBy = sortBy;
  }

  const sortOrder = searchParams.get('sortOrder') as 'ASC' | 'DESC' | null;
  if (sortOrder && ['ASC', 'DESC'].includes(sortOrder)) {
    state.sortOrder = sortOrder;
  }

  const page = searchParams.get('page');
  if (page) state.page = parseInt(page, 10);

  const perPage = searchParams.get('perPage');
  if (perPage) state.perPage = parseInt(perPage, 10);

  return state;
}

function serializeUrlState(
  state: UnifiedSearchState,
  facetGroups: FacetGroup[]
): URLSearchParams {
  const params = new URLSearchParams();
  const defaultState = getDefaultState();

  if (state.term) params.set('q', state.term);

  // Group facet values by facet code for cleaner URLs
  if (state.facetValueIds.length > 0 && facetGroups.length > 0) {
    facetGroups.forEach((facet) => {
      const selectedInFacet = facet.values
        .filter((v) => state.facetValueIds.includes(v.id))
        .map((v) => v.id);

      if (selectedInFacet.length > 0) {
        params.set(`f_${facet.code}`, selectedInFacet.join(','));
      }
    });
  }

  if (state.collectionId) params.set('collection', state.collectionId);
  if (state.enabled !== undefined) params.set('enabled', state.enabled.toString());
  if (state.isFeatured) params.set('featured', 'true');
  if (state.stockStatus !== 'all') params.set('stock', state.stockStatus);
  if (state.priceMin !== undefined) params.set('price_min', state.priceMin.toString());
  if (state.priceMax !== undefined) params.set('price_max', state.priceMax.toString());
  if (state.sortBy !== defaultState.sortBy) params.set('sortBy', state.sortBy);
  if (state.sortOrder !== defaultState.sortOrder) params.set('sortOrder', state.sortOrder);
  if (state.page !== 1) params.set('page', state.page.toString());
  if (state.perPage !== defaultState.perPage) params.set('perPage', state.perPage.toString());

  return params;
}

// ============================================================================
// Price Extraction Helper
// ============================================================================

function extractPrice(price: any): number | { min: number; max: number } {
  if (!price) return 0;

  if ('value' in price) {
    return price.value;
  }

  if ('min' in price && 'max' in price) {
    return { min: price.min, max: price.max };
  }

  return 0;
}

function getMinPrice(price: number | { min: number; max: number }): number {
  if (typeof price === 'number') return price;
  return price.min;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useUnifiedSearch(): UseUnifiedSearchReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize state from URL
  const [state, setState] = useState<UnifiedSearchState>(() => ({
    ...getDefaultState(),
    ...parseUrlState(searchParams),
  }));

  // Keep a ref to the latest state for use in effects that need current values
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Debounce search term to prevent excessive API calls
  const debouncedTerm = useDebounce(state.term, 300);

  // ============================================================================
  // Fetch Facets
  // ============================================================================

  const {
    data: facetsData,
    loading: facetsLoading,
    error: facetsError,
  } = useQuery(AdminFacetsWithValuesDocument);

  // ============================================================================
  // Fetch Collections
  // ============================================================================

  const {
    data: collectionsData,
    loading: collectionsLoading,
    error: collectionsError,
  } = useQuery(AdminCollectionsDocument, {
    variables: {
      options: {
        take: 100,
        sort: { position: SortOrder.Asc },
      },
    },
  });

  // ============================================================================
  // Build Facet Groups
  // ============================================================================

  const facetGroups = useMemo<FacetGroup[]>(() => {
    if (!facetsData?.facets?.items) return [];

    return facetsData.facets.items.map((facet) => ({
      id: facet.id,
      name: facet.name,
      code: facet.code,
      displayType: detectFacetType(facet.code),
      isPrivate: facet.isPrivate,
      values: facet.values.map((value) => ({
        id: value.id,
        name: value.name,
        code: value.code,
        // count is populated separately via the facetValueCounts map exposed
        // from this hook — kept at 0 here to avoid a dependency cycle with
        // the search query (which itself depends on facetGroups).
        count: 0,
      })),
      isExpanded: true,
    }));
  }, [facetsData]);

  // ============================================================================
  // Build Search Input
  // ============================================================================

  const searchInput = useMemo<SearchInput>(() => {
    const input: SearchInput = {
      skip: (state.page - 1) * state.perPage,
      take: state.perPage,
      groupByProduct: true,
    };

    // Full-text search (searches name + SKU)
    if (debouncedTerm) {
      input.term = debouncedTerm;
    }

    // Facet value filters
    if (state.facetValueIds.length > 0) {
      input.facetValueFilters = buildFacetValueFilters(
        state.facetValueIds,
        facetGroups
      ) as FacetValueFilterInput[];
    }

    // Collection filter
    if (state.collectionId) {
      input.collectionId = state.collectionId;
    }

    // Stock filter (server-side only supports inStock boolean)
    if (state.stockStatus === 'in_stock') {
      input.inStock = true;
    } else if (state.stockStatus === 'out_of_stock') {
      input.inStock = false;
    }

    // Sorting
    if (state.sortBy === 'name' || state.sortBy === 'price') {
      input.sort = {
        [state.sortBy]: state.sortOrder === 'ASC' ? SortOrder.Asc : SortOrder.Desc,
      };
    }

    return input;
  }, [debouncedTerm, state.facetValueIds, state.collectionId, state.stockStatus, state.sortBy, state.sortOrder, state.page, state.perPage, facetGroups]);

  // ============================================================================
  // Execute Search Query
  // ============================================================================

  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
  } = useQuery(AdminSearchProductsDocument, {
    variables: { input: searchInput },
    fetchPolicy: 'cache-and-network',
  });

  // ============================================================================
  // Process Search Results
  // ============================================================================

  const results = useMemo<SearchResultItem[]>(() => {
    if (!searchData?.search?.items) return [];

    let items = searchData.search.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productVariantId: item.productVariantId,
      productVariantName: item.productVariantName,
      sku: item.sku,
      slug: item.slug,
      description: item.description,
      enabled: item.enabled,
      inStock: item.inStock,
      score: item.score,
      productAsset: item.productAsset,
      price: extractPrice(item.price),
      priceWithTax: extractPrice(item.priceWithTax),
      currencyCode: item.currencyCode,
      collectionIds: item.collectionIds,
      facetIds: item.facetIds,
      facetValueIds: item.facetValueIds,
    }));

    // Apply client-side filters that aren't supported by the Search API

    // Filter by enabled status
    if (state.enabled !== undefined) {
      items = items.filter((item) => item.enabled === state.enabled);
    }

    // Filter by price range (client-side since Search API doesn't support it)
    if (state.priceMin !== undefined || state.priceMax !== undefined) {
      items = items.filter((item) => {
        const minPrice = getMinPrice(item.price);
        if (state.priceMin !== undefined && minPrice < state.priceMin) return false;
        if (state.priceMax !== undefined && minPrice > state.priceMax) return false;
        return true;
      });
    }

    // Note: isFeatured and low_stock need product data which Search API doesn't provide
    // These would need to be fetched separately or handled differently

    return items;
  }, [searchData, state.enabled, state.priceMin, state.priceMax]);

  // ============================================================================
  // Build Facet Value Counts
  // ============================================================================

  const facetValueCounts = useMemo<Map<string, number>>(() => {
    const counts = new Map<string, number>();

    searchData?.search?.facetValues?.forEach((fv) => {
      counts.set(fv.facetValue.id, fv.count);
    });

    return counts;
  }, [searchData]);

  // ============================================================================
  // Build Collections with Counts
  // ============================================================================

  const collections = useMemo<CollectionWithCount[]>(() => {
    if (!collectionsData?.collections?.items) return [];

    const collectionCounts = new Map<string, number>();
    searchData?.search?.collections?.forEach((c) => {
      collectionCounts.set(c.collection.id, c.count);
    });

    return collectionsData.collections.items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: collectionCounts.get(c.id) || 0,
    }));
  }, [collectionsData, searchData]);

  // ============================================================================
  // URL Sync
  // ============================================================================

  const updateUrl = useCallback(
    (newState: UnifiedSearchState) => {
      const params = serializeUrlState(newState, facetGroups);
      const paramString = params.toString();
      navigate(paramString ? `?${paramString}` : '', { replace: true });
    },
    [navigate, facetGroups]
  );

  // Sync URL changes to state
  useEffect(() => {
    const parsed = parseUrlState(searchParams);
    setState((prev) => ({
      ...prev,
      ...parsed,
    }));
  }, [searchParams]);

  // ============================================================================
  // Actions
  // ============================================================================

  const setTerm = useCallback(
    (term: string) => {
      // Use functional update to avoid stale closure issues
      setState((prev) => ({ ...prev, term, page: 1 }));
      // Don't update URL immediately - let debounce handle it
      // Only update URL for non-term changes
    },
    []
  );

  // Update URL when debounced term changes
  // Use stateRef to always get the latest state (avoids stale closure issues)
  useEffect(() => {
    updateUrl({ ...stateRef.current, term: debouncedTerm });
  }, [debouncedTerm, updateUrl]);

  const toggleFacetValue = useCallback(
    (id: string) => {
      const facetValueIds = state.facetValueIds.includes(id)
        ? state.facetValueIds.filter((fid) => fid !== id)
        : [...state.facetValueIds, id];

      const newState = { ...state, facetValueIds, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setFacetValues = useCallback(
    (ids: string[]) => {
      const newState = { ...state, facetValueIds: ids, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const clearFacetGroup = useCallback(
    (facetId: string) => {
      const group = facetGroups.find((g) => g.id === facetId);
      if (!group) return;

      const groupValueIds = new Set(group.values.map((v) => v.id));
      const facetValueIds = state.facetValueIds.filter((id) => !groupValueIds.has(id));

      const newState = { ...state, facetValueIds, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, facetGroups, updateUrl]
  );

  const setCollectionId = useCallback(
    (id?: string) => {
      const newState = { ...state, collectionId: id, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setEnabled = useCallback(
    (enabled?: boolean) => {
      const newState = { ...state, enabled, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setFeatured = useCallback(
    (featured?: boolean) => {
      const newState = { ...state, isFeatured: featured, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setStockStatus = useCallback(
    (status: StockStatus) => {
      const newState = { ...state, stockStatus: status, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      // Validate: min should be <= max
      const validMin = min !== undefined && max !== undefined && min > max ? max : min;
      const validMax = min !== undefined && max !== undefined && max < min ? min : max;

      const newState = { ...state, priceMin: validMin, priceMax: validMax, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setSorting = useCallback(
    (sortBy: SortByField, sortOrder: 'ASC' | 'DESC') => {
      const newState = { ...state, sortBy, sortOrder, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setPage = useCallback(
    (page: number) => {
      const newState = { ...state, page };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      const newState = { ...state, perPage, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const clearAllFilters = useCallback(() => {
    const newState = getDefaultState();
    setState(newState);
    updateUrl(newState);
  }, [updateUrl]);

  // ============================================================================
  // Helpers
  // ============================================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (state.term) count++;
    if (state.facetValueIds.length > 0) count += state.facetValueIds.length;
    if (state.collectionId) count++;
    if (state.enabled !== undefined) count++;
    if (state.isFeatured !== undefined) count++;
    if (state.stockStatus !== 'all') count++;
    if (state.priceMin !== undefined || state.priceMax !== undefined) count++;

    return count;
  }, [state]);

  const isFilterActive = useCallback(
    (facetValueId: string) => state.facetValueIds.includes(facetValueId),
    [state.facetValueIds]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    state,

    // Search Results
    results,
    totalItems: searchData?.search?.totalItems || 0,
    loading: searchLoading,
    error: searchError || facetsError || collectionsError || null,

    // Facet Data
    facetGroups,
    facetValueCounts,
    collections,
    facetsLoading,
    collectionsLoading,

    // Actions
    setTerm,
    toggleFacetValue,
    setFacetValues,
    clearFacetGroup,
    setCollectionId,
    setEnabled,
    setFeatured,
    setStockStatus,
    setPriceRange,
    setSorting,
    setPage,
    setPerPage,
    clearAllFilters,

    // Helpers
    activeFilterCount,
    isFilterActive,
  };
}

export default useUnifiedSearch;
