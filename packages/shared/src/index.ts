// Colors
export {
  COLOR_PALETTE,
  getColorHex,
  getColorDefinition,
  isValidHexColor,
  getContrastColor,
} from './colors';
export type { ColorDefinition } from './colors';

// Constants
export * from './constants';

// Formatters
export { formatPrice } from './formatters/price';

// Facet utilities
export {
  detectFacetType,
  buildFacetValueFilters,
  parseSearchParams,
  serializeSearchParams,
  getDefaultSearchState,
  isColorDark,
  sortSizes,
  PRICE_PRESETS,
  SIZE_ORDER,
} from './facet-utils';
export type {
  FacetDisplayType,
  FacetValueWithCount,
  FacetGroup,
  FacetedSearchState,
} from './facet-utils';
