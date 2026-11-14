/**
 * Cancelling an order the shop marked shipped. Staff click "Expédier" as soon as a customer confirms by phone,
 * so an Expédiée order may still be in the shop and must stay cancellable; the warning points to "Retour" for
 * parcels that really left.
 */

export const SHIPPED_CANCEL_WARNING =
  'Cette commande est marquée expédiée. Si le colis est déjà chez le livreur, utilisez plutôt « Retour ».';

const SHIPPED_STATES = ['Shipped', 'PartiallyShipped'];

/** Warning shown in the cancel dialog, or null when the order is not marked shipped. */
export function shippedCancelWarning(orderState: string): string | null {
  return SHIPPED_STATES.includes(orderState) ? SHIPPED_CANCEL_WARNING : null;
}

/** Shipment buttons ("Marquer expédié" / "Marquer livré") make no sense once the order is cancelled. */
export function shipmentActionsAllowed(orderState: string): boolean {
  return orderState !== 'Cancelled';
}
