// Rules behind cancelling an order the shop marked shipped.
// Run: pnpm --filter @oscar/backoffice test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shippedCancelWarning, shipmentActionsAllowed } from './order-cancel-rules';

const WARNING =
  'Cette commande est marquée expédiée. Si le colis est déjà chez le livreur, utilisez plutôt « Retour ».';

test('warning for orders marked shipped', () => {
  assert.equal(shippedCancelWarning('Shipped'), WARNING);
  assert.equal(shippedCancelWarning('PartiallyShipped'), WARNING);
});

test('no warning for other states', () => {
  for (const s of ['PaymentAuthorized', 'PaymentSettled', 'ArrangingPayment', 'Delivered', 'PartiallyDelivered', 'Cancelled']) {
    assert.equal(shippedCancelWarning(s), null, s);
  }
});

test('shipment actions hidden once the order is cancelled', () => {
  assert.equal(shipmentActionsAllowed('Cancelled'), false);
  for (const s of ['PaymentAuthorized', 'PaymentSettled', 'PartiallyShipped', 'Shipped', 'PartiallyDelivered']) {
    assert.equal(shipmentActionsAllowed(s), true, s);
  }
});
