import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCancellationReason, cancellationReason } from './cancellation-reason';

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

test('buildCancellationReason requires a preset, and details for "Autre"', () => {
  assert.equal(buildCancellationReason('', ''), null);
  assert.equal(buildCancellationReason('pas dispo', ''), null);
  assert.equal(buildCancellationReason('Client injoignable', '  '), 'Client injoignable');
  assert.equal(buildCancellationReason('Article ou taille non disponible', 'taille 42'), 'Article ou taille non disponible — taille 42');
  assert.equal(buildCancellationReason('Autre', ''), null);
  assert.equal(buildCancellationReason('Autre', ' erreur de prix '), 'erreur de prix');
});
