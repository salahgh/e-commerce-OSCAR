'use client';

import * as React from 'react';
import { useDeliveryDestinationsQuery, type DeliveryDestinationsQuery } from '@oscar/graphql-shop/generated';

export type DeliveryDestination = DeliveryDestinationsQuery['deliveryDestinations'][number];
export type DeliveryCommune = DeliveryDestination['communes'][number];

/**
 * Active delivery wilayas and communes, managed in the back-office. Drives the
 * checkout dropdowns and the delay estimate; the list rarely changes, so the
 * Apollo cache is reused across pages.
 */
export function useDeliveryDestinations() {
  const { data, loading, error } = useDeliveryDestinationsQuery({ fetchPolicy: 'cache-first' });
  const destinations = React.useMemo(() => data?.deliveryDestinations ?? [], [data]);
  return { destinations, loading, error };
}

/**
 * Addresses store the canonical French wilaya/commune names. Resolve one of
 * those names to its Arabic form for display in an Arabic UI; unknown names,
 * and any non-Arabic locale, get the name back unchanged.
 */
export function useLocalizePlaceName(locale: string) {
  const { destinations } = useDeliveryDestinations();
  const arabicByFrench = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const wilaya of destinations) {
      map.set(wilaya.name, wilaya.nameAr);
      for (const commune of wilaya.communes) map.set(commune.name, commune.nameAr);
    }
    return map;
  }, [destinations]);
  return React.useCallback(
    (name: string | null | undefined): string | null | undefined => {
      if (!name || locale !== 'ar') return name;
      return arabicByFrench.get(name) ?? name;
    },
    [arabicByFrench, locale],
  );
}
