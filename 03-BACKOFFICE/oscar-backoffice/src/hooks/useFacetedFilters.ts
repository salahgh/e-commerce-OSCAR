import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  AdminFacetsWithValuesDocument,
  AdminCollectionsDocument,
} from '../graphql/generated/graphql';
import {
  type FacetGroup,
  type AdminFilterState,
  detectFacetType,
  parseAdminFilterParams,
  serializeAdminFilterParams,
  getDefaultAdminFilterState,
  buildFacetValueFilters,
  getActiveFilterCount,
} from '../lib/facet-utils';

export interface UseFacetedFiltersReturn {
  // State
  state: AdminFilterState;
  facetGroups: FacetGroup[];
  collections: Array<{ id: string; name: string; slug: string; parentId?: string }>;

  // Loading/Error
  loading: boolean;
  collectionsLoading: boolean;
  error: Error | null;

  // Actions
  setSearchTerm: (term: string) => void;
  toggleFacetValue: (facetValueId: string) => void;
  setFacetValues: (facetValueIds: string[]) => void;
  clearFacetGroup: (facetId: string) => void;
  setCollectionIds: (ids: string[]) => void;
  setEnabled: (enabled?: boolean) => void;
  setFeatured: (featured?: boolean) => void;
  setStockStatus: (status: AdminFilterState['stockStatus']) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setSorting: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  clearAllFilters: () => void;

  // Helpers
  activeFilterCount: number;
  isFilterActive: (facetValueId: string) => boolean;

  // For GraphQL query building
  buildGraphQLFilters: () => {
    facetValueFilters: Array<{ or?: string[]; and?: string }>;
    collectionId?: string;
  };
}

export function useFacetedFilters(): UseFacetedFiltersReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse initial state from URL
  const [state, setState] = useState<AdminFilterState>(() => ({
    ...getDefaultAdminFilterState(),
    ...parseAdminFilterParams(searchParams),
  }));

  // Fetch facets
  const {
    data: facetsData,
    loading: facetsLoading,
    error: facetsError,
  } = useQuery(AdminFacetsWithValuesDocument);

  // Fetch collections
  const {
    data: collectionsData,
    loading: collectionsLoading,
    error: collectionsError,
  } = useQuery(AdminCollectionsDocument, {
    variables: {
      options: {
        take: 100,
        sort: { position: 'ASC' as any },
      },
    },
  });

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
        count: 0, // Admin API doesn't provide counts
      })),
      isExpanded: true,
    }));
  }, [facetsData]);

  // Build collections list
  const collections = useMemo(() => {
    if (!collectionsData?.collections?.items) return [];
    return collectionsData.collections.items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId || undefined,
    }));
  }, [collectionsData]);

  // Update URL when state changes
  const updateUrl = useCallback(
    (newState: AdminFilterState) => {
      const params = serializeAdminFilterParams(newState, facetGroups);
      const paramString = params.toString();
      navigate(paramString ? `?${paramString}` : '', { replace: true });
    },
    [navigate, facetGroups]
  );

  // Sync URL changes to state
  useEffect(() => {
    const parsed = parseAdminFilterParams(searchParams);
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

  const setCollectionIds = useCallback(
    (ids: string[]) => {
      const newState = { ...state, collectionIds: ids, page: 1 };
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
    (status: AdminFilterState['stockStatus']) => {
      const newState = { ...state, stockStatus: status, page: 1 };
      setState(newState);
      updateUrl(newState);
    },
    [state, updateUrl]
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
    (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
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
    const newState = getDefaultAdminFilterState();
    setState(newState);
    updateUrl(newState);
  }, [updateUrl]);

  const activeFilterCount = useMemo(() => getActiveFilterCount(state), [state]);

  const isFilterActive = useCallback(
    (facetValueId: string) => {
      return state.facetValueIds.includes(facetValueId);
    },
    [state.facetValueIds]
  );

  const buildGraphQLFilters = useCallback(() => {
    return {
      facetValueFilters: buildFacetValueFilters(state.facetValueIds, facetGroups),
      collectionId: state.collectionIds.length === 1 ? state.collectionIds[0] : undefined,
    };
  }, [state.facetValueIds, state.collectionIds, facetGroups]);

  return {
    state,
    facetGroups,
    collections,
    loading: facetsLoading,
    collectionsLoading,
    error: facetsError || collectionsError || null,
    setSearchTerm,
    toggleFacetValue,
    setFacetValues,
    clearFacetGroup,
    setCollectionIds,
    setEnabled,
    setFeatured,
    setStockStatus,
    setPriceRange,
    setSorting,
    setPage,
    setPerPage,
    clearAllFilters,
    activeFilterCount,
    isFilterActive,
    buildGraphQLFilters,
  };
}
