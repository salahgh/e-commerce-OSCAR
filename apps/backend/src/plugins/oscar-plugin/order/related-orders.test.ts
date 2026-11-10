import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  customerExtendBlocker,
  mergeBlocker,
  normalizePhone,
  placedCloseTogether,
} from './related-orders';

test('normalizePhone matches local and international forms', () => {
  assert.equal(normalizePhone('0555 12 34 56'), '0555123456');
  assert.equal(normalizePhone('+213 555 12 34 56'), '0555123456');
  assert.equal(normalizePhone('00213555123456'), '0555123456');
  assert.equal(normalizePhone('555123456'), '0555123456');
  assert.equal(normalizePhone('12'), '');
  assert.equal(normalizePhone(null), '');
});

const now = new Date('2026-11-10T12:00:00Z');
const cod = [{ method: 'cash-on-delivery', state: 'Authorized' }];
const placed = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60_000);

test('customer may extend a fresh COD order', () => {
  assert.equal(
    customerExtendBlocker({ state: 'PaymentAuthorized', orderPlacedAt: placed(5), fulfillmentCount: 0, payments: cod }, now),
    null,
  );
});

test('customer extension is refused when late, shipped, or not COD', () => {
  const base = { state: 'PaymentAuthorized', orderPlacedAt: placed(5), fulfillmentCount: 0, payments: cod };
  assert.equal(customerExtendBlocker({ ...base, orderPlacedAt: placed(31) }, now), 'EXPIRED');
  assert.equal(customerExtendBlocker({ ...base, orderPlacedAt: null }, now), 'NOT_PLACED');
  assert.equal(customerExtendBlocker({ ...base, state: 'Cancelled' }, now), 'NOT_EDITABLE');
  assert.equal(customerExtendBlocker({ ...base, fulfillmentCount: 1 }, now), 'NOT_EDITABLE');
  assert.equal(
    customerExtendBlocker({ ...base, payments: [{ method: 'cib', state: 'Authorized' }] }, now),
    'NOT_CASH_ON_DELIVERY',
  );
});

test('placedCloseTogether uses a 24h window both ways', () => {
  assert.equal(placedCloseTogether(placed(0), placed(60 * 23)), true);
  assert.equal(placedCloseTogether(placed(60 * 23), placed(0)), true);
  assert.equal(placedCloseTogether(placed(0), placed(60 * 25)), false);
  assert.equal(placedCloseTogether(null, placed(0)), false);
});

test('mergeBlocker', () => {
  const t = { id: '1', code: 'T', state: 'PaymentAuthorized', fulfillmentCount: 0 };
  const s = { id: '2', code: 'S', state: 'PaymentAuthorized', fulfillmentCount: 0, itemCount: 1 };
  assert.equal(mergeBlocker(t, s), null);
  assert.match(mergeBlocker(t, { ...s, id: '1' })!, /elle-même/);
  assert.match(mergeBlocker({ ...t, state: 'Shipped' }, s)!, /T/);
  assert.match(mergeBlocker(t, { ...s, fulfillmentCount: 1 })!, /S/);
  assert.match(mergeBlocker(t, { ...s, itemCount: 0 })!, /aucun article/);
});
