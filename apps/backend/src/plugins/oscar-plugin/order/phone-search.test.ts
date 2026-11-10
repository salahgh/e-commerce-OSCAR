import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phoneSearchCore } from './phone-search';

test('reduces any phone format to its core digits', () => {
  assert.equal(phoneSearchCore('0661234567'), '661234567');
  assert.equal(phoneSearchCore('+213 661 23 45 67'), '661234567');
  assert.equal(phoneSearchCore('00213661234567'), '661234567');
  assert.equal(phoneSearchCore('0661-23-45-67'), '661234567');
  assert.equal(phoneSearchCore('0661 23'), '66123');
});

test('partial numbers are searchable from 4 digits', () => {
  assert.equal(phoneSearchCore('4567'), '4567');
  assert.equal(phoneSearchCore('0661'), '661');
  assert.equal(phoneSearchCore('456'), null);
});

test('a short number starting with 213 is not mistaken for the country code', () => {
  assert.equal(phoneSearchCore('2134'), '2134');
});

test('a partial international number keeps working as it is typed', () => {
  assert.equal(phoneSearchCore('+213 661 23'), '66123');
  assert.equal(phoneSearchCore('00213 661'), '661');
});

test('text with letters is not a phone search', () => {
  assert.equal(phoneSearchCore('Amel'), null);
  assert.equal(phoneSearchCore('TXQ2BDS8'), null);
  assert.equal(phoneSearchCore(''), null);
  assert.equal(phoneSearchCore(null), null);
});
