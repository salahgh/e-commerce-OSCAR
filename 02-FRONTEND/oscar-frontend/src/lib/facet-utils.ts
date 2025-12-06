/**
 * Facet Utilities for Faceted Search
 * Shared utilities for handling Vendure facets in the frontend
 */

// Facet display types
export type FacetDisplayType = 'checkbox' | 'color-swatch' | 'size-button' | 'price-range';

// Facet value with count
export interface FacetValueWithCount {
  id: string;
  name: string;
  code: string;
  count: number;
  colorHex?: string;
}

// Facet group with values
export interface FacetGroup {
  id: string;
  name: string;
  code: string;
  displayType: FacetDisplayType;
  values: FacetValueWithCount[];
  isExpanded?: boolean;
}

// Search filter state
export interface FacetedSearchState {
  searchTerm: string;
  collectionSlug?: string;
  facetValueIds: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'ASC' | 'DESC';
  page: number;
  perPage: number;
}

/**
 * Detect the display type for a facet based on its code
 * @param code - The facet code
 * @returns The display type for the facet
 */
export function detectFacetType(code: string): FacetDisplayType {
  const lowerCode = code.toLowerCase();

  // Color facets
  if (
    lowerCode.includes('color') ||
    lowerCode.includes('couleur') ||
    lowerCode.includes('colour') ||
    lowerCode === 'لون' // Arabic for color
  ) {
    return 'color-swatch';
  }

  // Size facets
  if (
    lowerCode.includes('size') ||
    lowerCode.includes('taille') ||
    lowerCode.includes('pointure') ||
    lowerCode === 'مقاس' // Arabic for size
  ) {
    return 'size-button';
  }

  // Default to checkbox
  return 'checkbox';
}

/**
 * Build Vendure facetValueFilters array from selected facet value IDs
 * Groups values by facet for OR logic within facets, AND logic between facets
 * @param facetValueIds - Array of selected facet value IDs
 * @param facetGroups - All facet groups (to determine grouping)
 * @returns Array suitable for Vendure's facetValueFilters input
 */
export function buildFacetValueFilters(
  facetValueIds: string[],
  facetGroups: FacetGroup[]
): Array<{ or?: string[]; and?: string }> {
  if (facetValueIds.length === 0) return [];

  // Group selected values by facet
  const valuesByFacet = new Map<string, string[]>();

  facetGroups.forEach(facet => {
    const selectedInFacet = facet.values
      .filter(v => facetValueIds.includes(v.id))
      .map(v => v.id);

    if (selectedInFacet.length > 0) {
      valuesByFacet.set(facet.id, selectedInFacet);
    }
  });

  // Build filters: OR within facet, AND between facets
  const filters: Array<{ or?: string[]; and?: string }> = [];

  valuesByFacet.forEach((valueIds) => {
    if (valueIds.length === 1) {
      filters.push({ and: valueIds[0] });
    } else {
      filters.push({ or: valueIds });
    }
  });

  return filters;
}

/**
 * Parse URL search params into faceted search state
 * @param searchParams - URL search params
 * @returns Parsed search state
 */
export function parseSearchParams(searchParams: URLSearchParams): Partial<FacetedSearchState> {
  const state: Partial<FacetedSearchState> = {};

  const q = searchParams.get('q');
  if (q) state.searchTerm = q;

  const collection = searchParams.get('collection');
  if (collection) state.collectionSlug = collection;

  // Parse facet value IDs from f_{facetCode} params
  const facetValueIds: string[] = [];
  searchParams.forEach((value, key) => {
    if (key.startsWith('f_')) {
      const ids = value.split(',').filter(Boolean);
      facetValueIds.push(...ids);
    }
  });
  if (facetValueIds.length > 0) state.facetValueIds = facetValueIds;

  const priceMin = searchParams.get('price_min');
  if (priceMin) state.priceMin = parseInt(priceMin, 10);

  const priceMax = searchParams.get('price_max');
  if (priceMax) state.priceMax = parseInt(priceMax, 10);

  const sortBy = searchParams.get('sortBy');
  if (sortBy === 'name' || sortBy === 'price' || sortBy === 'createdAt') {
    state.sortBy = sortBy;
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'ASC' || sortOrder === 'DESC') {
    state.sortOrder = sortOrder;
  }

  const page = searchParams.get('page');
  if (page) state.page = parseInt(page, 10);

  const perPage = searchParams.get('perPage');
  if (perPage) state.perPage = parseInt(perPage, 10);

  return state;
}

/**
 * Serialize faceted search state to URL search params
 * @param state - Current search state
 * @param facetGroups - All facet groups (for building f_{code} params)
 * @returns URLSearchParams object
 */
export function serializeSearchParams(
  state: Partial<FacetedSearchState>,
  facetGroups: FacetGroup[]
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.searchTerm) params.set('q', state.searchTerm);
  if (state.collectionSlug) params.set('collection', state.collectionSlug);

  // Group facet value IDs by facet code
  if (state.facetValueIds && state.facetValueIds.length > 0) {
    facetGroups.forEach(facet => {
      const selectedInFacet = facet.values
        .filter(v => state.facetValueIds?.includes(v.id))
        .map(v => v.id);

      if (selectedInFacet.length > 0) {
        params.set(`f_${facet.code}`, selectedInFacet.join(','));
      }
    });
  }

  if (state.priceMin !== undefined) params.set('price_min', state.priceMin.toString());
  if (state.priceMax !== undefined) params.set('price_max', state.priceMax.toString());
  if (state.sortBy && state.sortBy !== 'name') params.set('sortBy', state.sortBy);
  if (state.sortOrder && state.sortOrder !== 'ASC') params.set('sortOrder', state.sortOrder);
  if (state.page && state.page !== 1) params.set('page', state.page.toString());
  if (state.perPage && state.perPage !== 24) params.set('perPage', state.perPage.toString());

  return params;
}

/**
 * Get default search state
 * @returns Default FacetedSearchState
 */
export function getDefaultSearchState(): FacetedSearchState {
  return {
    searchTerm: '',
    facetValueIds: [],
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    perPage: 24,
  };
}

/**
 * Check if a color is dark (for text contrast)
 * @param hexColor - Hex color string (with or without #)
 * @returns true if the color is dark
 */
export function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Format price for display
 * @param price - Price in cents
 * @param currencyCode - Currency code (default: DZD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currencyCode: string = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price / 100);
}

/**
 * Price range presets in cents
 */
export const PRICE_PRESETS = [
  { label: 'Moins de 5,000 DA', min: 0, max: 500000 },
  { label: '5,000 - 15,000 DA', min: 500000, max: 1500000 },
  { label: '15,000 - 30,000 DA', min: 1500000, max: 3000000 },
  { label: '30,000 - 50,000 DA', min: 3000000, max: 5000000 },
  { label: 'Plus de 50,000 DA', min: 5000000, max: undefined },
];

/**
 * Size order for sorting
 */
export const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL'];

/**
 * Sort size values in correct order
 * @param sizes - Array of size names
 * @returns Sorted array
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.toUpperCase());
    const indexB = SIZE_ORDER.indexOf(b.toUpperCase());

    // If both are standard sizes, sort by order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is a standard size, put it first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // For numeric sizes (like shoe sizes), sort numerically
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // Default to alphabetical
    return a.localeCompare(b);
  });
}
