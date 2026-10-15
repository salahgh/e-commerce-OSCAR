import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cancellationReason } from './cancellation-reason';

const cancel = (reason?: string) => ({ type: 'ORDER_CANCELLATION', data: reason === undefined ? {} : { reason } });

test('reads the reason of the latest cancellation entry (history is newest first)', () => {
  const history = [
    { type: 'ORDER_STATE_TRANSITION', data: { from: 'Nouvelle', to: 'Cancelled' } },
    cancel('PAS DISPONIBLE'),
    cancel('older reason'),
  ];
  assert.equal(cancellationReason(null, history), 'PAS DISPONIBLE');
});

test('prefers the custom field when it is set', () => {
  assert.equal(cancellationReason('from field', [cancel('from history')]), 'from field');
});

test('returns null when no reason was given', () => {
  assert.equal(cancellationReason(null, [cancel()]), null);
  assert.equal(cancellationReason('  ', [cancel('  ')]), null);
  assert.equal(cancellationReason(undefined, undefined), null);
});
