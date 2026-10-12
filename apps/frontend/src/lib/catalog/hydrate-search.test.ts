import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idsToHydrate, orderedProducts } from './hydrate-search';

const items = (...ids: string[]) => ids.map((productId) => ({ productId }));

test('idsToHydrate returns only the product ids not yet hydrated, unique and in search order', () => {
  const hydrated = new Map([['1', { id: '1' }], ['3', { id: '3' }]]);
  assert.deepEqual(idsToHydrate(items('1', '2', '3', '4', '2'), hydrated), ['2', '4']);
});

test('idsToHydrate is empty once every page is hydrated, so nothing refetches', () => {
  const hydrated = new Map([['1', { id: '1' }], ['2', { id: '2' }]]);
  assert.deepEqual(idsToHydrate(items('1', '2'), hydrated), []);
});

test('orderedProducts keeps the search order and skips products not hydrated yet', () => {
  const hydrated = new Map([['2', { id: '2' }], ['1', { id: '1' }]]);
  assert.deepEqual(orderedProducts(items('1', '3', '2', '1'), hydrated), [{ id: '1' }, { id: '2' }]);
});
