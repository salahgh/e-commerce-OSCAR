import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { DeliveryWilayasDocument, type DeliveryWilayaFieldsFragment } from '../graphql/generated/graphql';

export type DeliveryWilaya = DeliveryWilayaFieldsFragment;
export type DeliveryCommune = DeliveryWilaya['communes'][number];

/** Delay zone labels shared by the settings page and anything else that shows a zone. */
export const SHIPPING_ZONE_LABELS: Record<number, string> = {
  1: 'Zone 1 — 1 à 2 jours ouvrés',
  2: 'Zone 2 — 2 à 4 jours ouvrés',
  3: 'Zone 3 — 3 à 5 jours ouvrés',
  4: 'Zone 4 — 5 à 7 jours ouvrés',
};

/**
 * Every delivery wilaya (active or not) managed in Settings → Livraison, plus
 * the sorted French names the order and customer filters offer. Orders and
 * customers store the wilaya as text, so inactive wilayas stay listed here:
 * old orders still reference them.
 */
export function useDeliveryWilayas() {
  const { data, loading, error, refetch } = useQuery(DeliveryWilayasDocument);
  const wilayas = useMemo(() => data?.deliveryWilayas ?? [], [data]);
  const names = useMemo(
    () => wilayas.map((w) => w.name).sort((a, b) => a.localeCompare(b, 'fr')),
    [wilayas]
  );
  return { wilayas, names, loading, error, refetch };
}
