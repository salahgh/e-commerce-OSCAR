import React from 'react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

// Mock the slug query hook (the screen reads data from it).
const mockUseGetProductBySlugQuery = jest.fn();
jest.mock('@/src/graphql/generated/graphql', () => ({
  useGetProductBySlugQuery: (opts: any) => mockUseGetProductBySlugQuery(opts),
}));

// Mock contexts so the screen does not need real Apollo providers.
jest.mock('@/src/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: jest.fn(), loading: false }),
}));
jest.mock('@/src/contexts/WishlistContext', () => ({
  useWishlist: () => ({ has: () => false, toggle: jest.fn() }),
}));
jest.mock('@/src/contexts/RecentlyViewedContext', () => ({
  useRecentlyViewed: () => ({ items: [], track: jest.fn(), clear: jest.fn(), hydrating: false }),
}));

// Mock heavy/native child barrels and expo-image so only the screen's own code runs.
jest.mock('@/src/components/products', () => ({
  ImageCarousel: () => null,
  SizeGuideModal: () => null,
  RelatedProducts: () => null,
  RecentlyViewedRow: () => null,
}));
jest.mock('@/src/components/ui', () => {
  const { Text } = require('react-native');
  const Stub = ({ title }: any) => (title ? <Text>{title}</Text> : null);
  return {
    Button: Stub,
    LoadingSpinner: () => null,
    ErrorState: ({ title }: any) => <Text>{title}</Text>,
    Badge: Stub,
    Chip: Stub,
  };
});
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ slug: 'blue-shirt' }),
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

import ProductDetailScreen from '../[slug]';

const PRODUCT = {
  id: 'p1',
  name: 'Blue Shirt',
  slug: 'blue-shirt',
  description: 'A shirt',
  featuredAsset: { preview: 'http://img/p.jpg' },
  assets: [{ preview: 'http://img/p.jpg' }],
  collections: [{ id: 'c1', name: 'Shirts', slug: 'shirts' }],
  variants: [
    {
      id: 'v1',
      name: 'Blue / M',
      sku: 'SKU1',
      priceWithTax: 250000,
      currencyCode: 'DZD',
      stockLevel: 'IN_STOCK',
      options: [],
    },
  ],
};

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    mockUseGetProductBySlugQuery.mockReturnValue({
      data: { product: PRODUCT },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });
  });

  it('renders the product without crashing and queries by slug', () => {
    const { getByText } = renderWithProviders(<ProductDetailScreen />);
    expect(getByText('Blue Shirt')).toBeTruthy();
    expect(mockUseGetProductBySlugQuery).toHaveBeenCalledWith({ variables: { slug: 'blue-shirt' } });
  });
});
