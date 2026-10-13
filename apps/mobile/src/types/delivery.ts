import type { DeliveryDestinationsQuery } from '../graphql/generated/graphql';

/**
 * A delivery wilaya as served by the shop API `deliveryDestinations` query
 * (managed in the back-office). The address helpers take a list of these.
 */
export type Wilaya = DeliveryDestinationsQuery['deliveryDestinations'][number];
export type Commune = Wilaya['communes'][number];
