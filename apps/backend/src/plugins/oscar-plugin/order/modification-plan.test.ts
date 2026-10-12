// Unit tests for the pure order-modification planner used by modifyOrderGuided.
// Run: pnpm --filter @oscar/backend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planModification, isModifiableState } from './modification-plan';

const cod = { id: '10', method: 'cash-on-delivery', state: 'Authorized', amount: 500000 };
const codSettled = { id: '11', method: 'cash-on-delivery', state: 'Settled', amount: 500000 };

test('isModifiableState: only unshipped orders', () => {
  assert.equal(isModifiableState('PaymentAuthorized'), true);
  assert.equal(isModifiableState('PaymentSettled'), true);
  assert.equal(isModifiableState('Shipped'), false);
  assert.equal(isModifiableState('Delivered'), false);
  assert.equal(isModifiableState('Cancelled'), false);
});

test('COD, unpaid, total goes up: raise the COD authorization, back to PaymentAuthorized', () => {
  const plan = planModification({ fromState: 'PaymentAuthorized', delta: 120000, newTotal: 620000, payments: [cod] });
  assert.deepEqual(plan, { returnState: 'PaymentAuthorized', codPaymentId: '10', codAmountToSet: 620000 });
});

test('COD, unpaid, total goes down: Vendure needs a refund target, use the COD payment', () => {
  const plan = planModification({ fromState: 'PaymentAuthorized', delta: -100000, newTotal: 400000, payments: [cod] });
  assert.deepEqual(plan, { returnState: 'PaymentAuthorized', refundPaymentId: '10' });
});

test('COD, unpaid, total unchanged: nothing to adjust', () => {
  const plan = planModification({ fromState: 'PaymentAuthorized', delta: 0, newTotal: 500000, payments: [cod] });
  assert.deepEqual(plan, { returnState: 'PaymentAuthorized' });
});

test('already paid, total goes up: extra cash still to collect → ArrangingAdditionalPayment', () => {
  const plan = planModification({ fromState: 'PaymentSettled', delta: 50000, newTotal: 550000, payments: [codSettled] });
  assert.deepEqual(plan, { returnState: 'ArrangingAdditionalPayment' });
});

test('already paid, total goes down: refund against the settled payment, stay PaymentSettled', () => {
  const plan = planModification({ fromState: 'PaymentSettled', delta: -50000, newTotal: 450000, payments: [codSettled] });
  assert.deepEqual(plan, { returnState: 'PaymentSettled', refundPaymentId: '11' });
});

test('authorized by a non-COD method, total goes up: needs an additional payment', () => {
  const card = { id: '12', method: 'cib', state: 'Authorized', amount: 500000 };
  const plan = planModification({ fromState: 'PaymentAuthorized', delta: 10000, newTotal: 510000, payments: [card] });
  assert.deepEqual(plan, { returnState: 'ArrangingAdditionalPayment' });
});

test('unshipped order with no payment at all and a decrease: no refund target, no refund', () => {
  const plan = planModification({ fromState: 'PaymentAuthorized', delta: -10000, newTotal: 490000, payments: [] });
  assert.deepEqual(plan, { returnState: 'PaymentAuthorized' });
});
