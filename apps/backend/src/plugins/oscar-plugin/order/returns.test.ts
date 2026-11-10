import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReturnReason,
  defaultRestock,
  parseReturnReason,
  returnBlocker,
  returnableQuantity,
} from './returns';

test('buildReturnReason', () => {
  assert.equal(buildReturnReason('SIZE'), 'Retour — Taille ne convient pas');
  assert.equal(buildReturnReason('SIZE', ' trop petit '), 'Retour — Taille ne convient pas — trop petit');
  assert.equal(buildReturnReason('OTHER', ''), null);
  assert.equal(buildReturnReason('OTHER', 'colis abîmé'), 'Retour — colis abîmé');
  assert.equal(buildReturnReason('NOPE'), null);
});

test('parseReturnReason groups by label and ignores non-returns', () => {
  assert.equal(parseReturnReason('Retour — Taille ne convient pas — trop petit'), 'Taille ne convient pas');
  assert.equal(parseReturnReason('Retour — Refus à la livraison'), 'Refus à la livraison');
  assert.equal(parseReturnReason('Retour — colis abîmé'), 'Autre');
  assert.equal(parseReturnReason('PAS DISPO'), null);
  assert.equal(parseReturnReason(null), null);
});

test('defective items are not restocked by default', () => {
  assert.equal(defaultRestock('DEFECTIVE'), false);
  assert.equal(defaultRestock('SIZE'), true);
});

test('returnableQuantity = shipped − already returned, capped by the line', () => {
  assert.equal(returnableQuantity({ quantity: 2, fulfilled: 2, returned: 0 }), 2);
  assert.equal(returnableQuantity({ quantity: 1, fulfilled: 2, returned: 1 }), 1);
  assert.equal(returnableQuantity({ quantity: 3, fulfilled: 1, returned: 0 }), 1, 'unshipped units are not returns');
  assert.equal(returnableQuantity({ quantity: 0, fulfilled: 2, returned: 2 }), 0);
});

test('returnBlocker', () => {
  const max = new Map([['1', 2], ['2', 0]]);
  assert.match(returnBlocker('PaymentAuthorized', [{ orderLineId: '1', quantity: 1 }], max)!, /expédiée ou livrée/);
  assert.match(returnBlocker('Delivered', [{ orderLineId: '1', quantity: 0 }], max)!, /au moins un article/);
  assert.match(returnBlocker('Delivered', [{ orderLineId: '1', quantity: 3 }], max)!, /maximum retournable : 2/);
  assert.match(returnBlocker('Shipped', [{ orderLineId: '2', quantity: 1 }], max)!, /maximum retournable : 0/);
  assert.equal(returnBlocker('Delivered', [{ orderLineId: '1', quantity: 2 }], max), null);
});
