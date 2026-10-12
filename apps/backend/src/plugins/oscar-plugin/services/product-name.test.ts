// Unit tests for the pure translation-picking helper used by productsWithoutVariants.
// Run: pnpm --filter @oscar/backend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickProductName } from './product-name';

const translations = [
  { languageCode: 'fr', name: 'Pull simple' },
  { languageCode: 'ar', name: 'كنزة بسيطة' },
  { languageCode: 'en', name: 'Plain sweater' },
];

test('pickProductName prefers the request language', () => {
  assert.equal(pickProductName(translations, 'ar', 'fr'), 'كنزة بسيطة');
});

test('pickProductName falls back to the channel default language', () => {
  assert.equal(pickProductName(translations, 'de', 'fr'), 'Pull simple');
});

test('pickProductName falls back to the first non-empty translation', () => {
  assert.equal(pickProductName([{ languageCode: 'en', name: '' }, { languageCode: 'ar', name: 'x' }], 'fr', 'fr'), 'x');
});

test('pickProductName returns empty string when there are no translations', () => {
  assert.equal(pickProductName([], 'fr', 'fr'), '');
  assert.equal(pickProductName(undefined, 'fr', 'fr'), '');
});
