'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import {
  GetFacetsWithDetailsDocument,
  SearchProductsWithFacetsDocument,
  type SearchInput,
  SortOrder,
} from '@/graphql/generated/graphql';
import {
  type FacetGroup,
  type FacetedSearchState,
  detectFacetType,
  parseSearchParams,
  serializeSearchParams,
  getDefaultSearchState,
  buildFacetValueFilters,
} from '@/lib/facet-utils';

export interface SearchProduct {
  productId: string;
  productName: string;
  slug: string;
  description?: string;
  productAsset?: {
    id: string;
    preview: string;
  } | null;
  priceWithTax:
    | { __typename: 'SinglePrice'; value: number }
    | { __typename: 'PriceRange'; min: number; max: number };
  currencyCode: string;
  collectionIds: string[];
  inStock: boolean;
}

export interface UseFacetedSearchReturn {
  // State
  state: FacetedSearchState;
  facetGroups: FacetGroup[];
  products: SearchProduct[];
  totalItems: number;

  // Loading/Error
  loading: boolean;
  facetsLoading: boolean;
  error: Error | null;

  // Actions
  setSearchTerm: (term: string) => void;
  setCollectionSlug: (slug?: string) => void;
  toggleFacetValue: (facetValueId: string) => void;
  setFacetValues: (facetValueIds: string[]) => void;
  clearFacetGroup: (facetId: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setSorting: (sortBy: FacetedSearchState['sortBy'], sortOrder: FacetedSearchState['sortOrder']) => void;
  setPage: (page: number) => void;
  clearAllFilters: () => void;

  // Helpers
  getActiveFiltersCount: () => number;
  isFilterActive: (facetValueId: string) => boolean;
}

export function useFacetedSearch(): UseFacetedSearchReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const [state, setState] = useState<FacetedSearchState>(() => ({
    ...getDefaultSearchState(),
    ...parseSearchParams(new URLSearchParams(searchParams.toString())),
  }));

  // Fetch facets
  const {
    data: facetsData,
    loading: facetsLoading,
    error: facetsError,
  } = useQuery(GetFacetsWithDetailsDocument);

  // Build facet groups from API data
  const facetGroups = useMemo<FacetGroup[]>(() => {
    if (!facetsData?.facets?.items) return [];

    return facetsData.facets.items.map((facet) => ({
      id: facet.id,
      name: facet.name,
      code: facet.code,
      displayType: detectFacetType(facet.code),
      values: facet.values.map((value) => ({
        id: value.id,
        name: value.name,
        code: value.code,
        count: 0, // Will be updated from search results
      })),
      isExpanded: true,
    }));
  }, [facetsData]);

  // Build search input
  const searchInput = useMemo<SearchInput>(() => {
    const input: SearchInput = {
      groupByProduct: true,
      take: state.perPage,
      skip: (state.page - 1) * state.perPage,
    };

    if (state.searchTerm) {
      input.term = state.searchTerm;
    }

    if (state.collectionSlug) {
      input.collectionSlug = state.collectionSlug;
    }

    // Build facet value filters - works even if facetGroups not fully loaded
    if (state.facetValueIds.length > 0) {
      const facetFilters = buildFacetValueFilters(state.facetValueIds, facetGroups);
      if (facetFilters.length > 0) {
        input.facetValueFilters = facetFilters;
      }
    }

    // Note: Vendure search doesn't support price filtering directly
    // You might need custom logic or a plugin for this

    // Sorting - convert string to SortOrder enum
    const sortOrderEnum = state.sortOrder === 'ASC' ? SortOrder.Asc : SortOrder.Desc;
    if (state.sortBy === 'price') {
      input.sort = { price: sortOrderEnum };
    } else if (state.sortBy === 'name') {
      input.sort = { name: sortOrderEnum };
    }

    return input;
  }, [state, facetGroups]);

  // Fetch products - don't skip, search should work independently of facets
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
  } = useQuery(SearchProductsWithFacetsDocument, {
    variables: { input: searchInput },
  });

  // Update facet counts from search results
  const facetGroupsWithCounts = useMemo<FacetGroup[]>(() => {
    if (!searchData?.search?.facetValues) return facetGroups;

    const countMap = new Map<string, number>();
    searchData.search.facetValues.forEach((fv) => {
      countMap.set(fv.facetValue.id, fv.count);
    });

    return facetGroups.map((group) => ({
      ...group,
      values: group.values.map((value) => ({
        ...value,
        count: countMap.get(value.id) || 0,
      })),
    }));
  }, [facetGroups, searchData]);

  // Products from search
  const products = useMemo<SearchProduct[]>(() => {
    if (!searchData?.search?.items) return [];
    return searchData.search.items as SearchProduct[];
  }, [searchData]);

  // Update URL when state changes
  const updateUrl = useCallback(
    (newState: FacetedSearchState) => {
      const params = serializeSearchParams(newState, facetGroups);
      const paramString = params.toString();
      const newUrl = paramString ? `${pathname}?${paramString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, facetGroups]
  );

  // Sync URL changes to state
  useEffect(() => {
    const parsed = parseSearchParams(new URLSearchParams(searchParams.toString()));
    setState((prev) => ({
      ...prev,
      ...parsed,
    }));
  }, [searchParams]);

  // Actions
  const setSearchTerm = useCallback(
    (term: string) => {
      const newState = { ...state, searchTerm: term, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setCollectionSlug = useCallback(
    (slug?: string) => {
      const newState = { ...state, collectionSlug: slug, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const toggleFacetValue = useCallback(
    (facetValueId: string) => {
      const facetValueIds = state.facetValueIds.includes(facetValueId)
        ? state.facetValueIds.filter((id) => id !== facetValueId)
        : [...state.facetValueIds, facetValueId];

      const newState = { ...state, facetValueIds, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setFacetValues = useCallback(
    (facetValueIds: string[]) => {
      const newState = { ...state, facetValueIds, page: 1 };
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

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      const newState = { ...state, priceMin: min, priceMax: max, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
  );

  const setSorting = useCallback(
    (sortBy: FacetedSearchState['sortBy'], sortOrder: FacetedSearchState['sortOrder']) => {
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

  const clearAllFilters = useCallback(() => {
    const newState = getDefaultSearchState();
    setState(newState);
    updateUrl(newState);
  }, [updateUrl]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (state.searchTerm) count++;
    count += state.facetValueIds.length;
    if (state.priceMin !== undefined || state.priceMax !== undefined) count++;
    if (state.collectionSlug) count++;
    return count;
  }, [state]);

  const isFilterActive = useCallback(
    (facetValueId: string) => {
      return state.facetValueIds.includes(facetValueId);
    },
    [state.facetValueIds]
  );

  return {
    state,
    facetGroups: facetGroupsWithCounts,
    products,
    totalItems: searchData?.search?.totalItems || 0,
    loading: searchLoading,
    facetsLoading,
    error: facetsError || searchError || null,
    setSearchTerm,
    setCollectionSlug,
    toggleFacetValue,
    setFacetValues,
    clearFacetGroup,
    setPriceRange,
    setSorting,
    setPage,
    clearAllFilters,
    getActiveFiltersCount,
    isFilterActive,
  };
}
