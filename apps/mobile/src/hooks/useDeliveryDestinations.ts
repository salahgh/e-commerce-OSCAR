import { useMemo } from 'react';
import { useDeliveryDestinationsQuery } from '../graphql/generated/graphql';
import type { Wilaya } from '../types/delivery';

const EMPTY: Wilaya[] = [];

/**
 * Active delivery wilayas and communes, managed in the back-office. The list
 * rarely changes, so the persisted Apollo cache answers first and a network
 * refresh follows.
 */
export function useDeliveryDestinations() {
  const { data, loading, error, refetch } = useDeliveryDestinationsQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const wilayas = useMemo(() => data?.deliveryDestinations ?? EMPTY, [data]);
  return { wilayas, loading: loading && wilayas.length === 0, error, refetch };
}
