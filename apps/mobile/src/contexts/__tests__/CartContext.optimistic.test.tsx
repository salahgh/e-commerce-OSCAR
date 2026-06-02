import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Capture the options passed to the add mutation.
const mockAddItem = jest.fn().mockResolvedValue({
  data: { addItemToOrder: { __typename: 'Order', id: 'o1' } },
});
const mockNoop = jest.fn().mockResolvedValue({ data: {} });

jest.mock('../../graphql/generated/graphql', () => ({
  ...jest.requireActual('../../graphql/generated/graphql'),
  useGetActiveOrderQuery: () => ({ data: { activeOrder: null }, loading: false, error: undefined, refetch: jest.fn() }),
  useAddItemToOrderMutation: () => [mockAddItem, { loading: false }],
  useAdjustOrderLineMutation: () => [mockNoop, { loading: false }],
  useRemoveOrderLineMutation: () => [mockNoop, { loading: false }],
  useRemoveAllOrderLinesMutation: () => [mockNoop, { loading: false }],
}));

import { CartProvider, useCart } from '../CartContext';
import type { OptimisticCartVariant } from '../../utils/optimisticCart';

const SNAPSHOT: OptimisticCartVariant = {
  productVariantId: 'pv1',
  unitPriceWithTax: 250000,
  name: 'Red / M',
  sku: 'SKU-1',
  product: { id: 'p1', name: 'T-Shirt', slug: 't-shirt', featuredAsset: null },
  featuredAsset: null,
};

function Consumer() {
  const { addToCart } = useCart();
  return <Text testID="add" onPress={() => addToCart('pv1', 2, SNAPSHOT)}>add</Text>;
}

describe('CartContext optimistic wiring', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes an optimisticResponse + update and NO refetchQueries to addItemToOrder', async () => {
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>,
    );

    fireEvent.press(screen.getByTestId('add'));

    await waitFor(() => expect(mockAddItem).toHaveBeenCalled());
    const opts = mockAddItem.mock.calls[0][0];

    expect(opts.refetchQueries).toBeUndefined();
    expect(typeof opts.update).toBe('function');
    expect(opts.optimisticResponse.addItemToOrder.lines).toHaveLength(1);
    expect(opts.optimisticResponse.addItemToOrder.lines[0].linePriceWithTax).toBe(500000);
    expect(opts.optimisticResponse.addItemToOrder.totalQuantity).toBe(2);
  });
});
