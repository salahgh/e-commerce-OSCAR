import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ancestorIds,
  assignmentPlan,
  flattenTree,
  productIdsOf,
  withProduct,
  withoutProduct,
  type CollectionLike,
} from './collection-filters';

const facet = { code: 'facet-value-filter', args: [{ name: 'facetValueIds', value: '["1"]' }] };
const ids = (list: string[]) => ({
  code: 'product-id-filter',
  args: [{ name: 'productIds', value: JSON.stringify(list) }],
});

test('productIdsOf reads the product-id filter and tolerates bad data', () => {
  assert.deepEqual(productIdsOf({ id: 'a', filters: [facet, ids(['1', '2'])] }), ['1', '2']);
  assert.deepEqual(productIdsOf({ id: 'a', filters: [facet] }), []);
  assert.deepEqual(productIdsOf({ id: 'a', filters: null }), []);
  assert.deepEqual(
    productIdsOf({ id: 'a', filters: [{ code: 'product-id-filter', args: [{ name: 'productIds', value: 'oops' }] }] }),
    [],
  );
});

test('withProduct keeps every other filter and appends the id once', () => {
  const out = withProduct([facet, ids(['1'])], '2');
  assert.deepEqual(out, [
    { code: 'facet-value-filter', arguments: [{ name: 'facetValueIds', value: '["1"]' }] },
    { code: 'product-id-filter', arguments: [{ name: 'productIds', value: '["1","2"]' }] },
  ]);
  // idempotent
  assert.deepEqual(withProduct([ids(['1', '2'])], '2'), [
    { code: 'product-id-filter', arguments: [{ name: 'productIds', value: '["1","2"]' }] },
  ]);
});

test('withProduct creates a product-id filter when there is none, as OR with other filters', () => {
  assert.deepEqual(withProduct([facet], '7'), [
    { code: 'facet-value-filter', arguments: [{ name: 'facetValueIds', value: '["1"]' }] },
    {
      code: 'product-id-filter',
      arguments: [
        { name: 'productIds', value: '["7"]' },
        { name: 'combineWithAnd', value: 'false' },
      ],
    },
  ]);
  assert.deepEqual(withProduct([], '7'), [
    {
      code: 'product-id-filter',
      arguments: [
        { name: 'productIds', value: '["7"]' },
        { name: 'combineWithAnd', value: 'false' },
      ],
    },
  ]);
});

test('withProduct preserves extra arguments of an existing product-id filter', () => {
  const existing = {
    code: 'product-id-filter',
    args: [
      { name: 'productIds', value: '["1"]' },
      { name: 'combineWithAnd', value: 'true' },
    ],
  };
  assert.deepEqual(withProduct([existing], '2'), [
    {
      code: 'product-id-filter',
      arguments: [
        { name: 'productIds', value: '["1","2"]' },
        { name: 'combineWithAnd', value: 'true' },
      ],
    },
  ]);
});

test('withoutProduct removes the id, drops an emptied product-id filter, keeps the rest', () => {
  assert.deepEqual(withoutProduct([facet, ids(['1', '2'])], '2'), [
    { code: 'facet-value-filter', arguments: [{ name: 'facetValueIds', value: '["1"]' }] },
    { code: 'product-id-filter', arguments: [{ name: 'productIds', value: '["1"]' }] },
  ]);
  assert.deepEqual(withoutProduct([facet, ids(['2'])], '2'), [
    { code: 'facet-value-filter', arguments: [{ name: 'facetValueIds', value: '["1"]' }] },
  ]);
  assert.deepEqual(withoutProduct([ids(['2'])], '2'), []);
  // untouched when the id is not there
  assert.deepEqual(withoutProduct([ids(['1'])], '2'), [
    { code: 'product-id-filter', arguments: [{ name: 'productIds', value: '["1"]' }] },
  ]);
});

const tree: CollectionLike[] = [
  { id: '2', parentId: '1', name: 'Homme', filters: [ids(['10'])] },
  { id: '57', parentId: '2', name: 'Ensembles', filters: [ids(['10'])] },
  { id: '58', parentId: '57', name: 'Ensemble sport', filters: [ids([])] },
  { id: '43', parentId: '1', name: 'Cosmétique', filters: [facet] },
  { id: '94', parentId: '43', name: 'Shampoings', filters: [ids(['20'])] },
  { id: '96', parentId: '43', name: 'Crème', filters: [] },
];

test('ancestorIds walks up to, but not including, the root', () => {
  assert.deepEqual(ancestorIds('58', tree), ['57', '2']);
  assert.deepEqual(ancestorIds('2', tree), []);
  assert.deepEqual(ancestorIds('unknown', tree), []);
});

test('assignmentPlan adds the product to the target and to product-list ancestors only', () => {
  const plan = assignmentPlan(tree, '99', { add: ['58'], remove: [] });
  assert.deepEqual(
    plan.map((p) => p.collectionId),
    ['58', '57', '2'],
  );
  assert.deepEqual(productIdsOf({ id: 'x', filters: plan[2].filters.map(toStored) }), ['10', '99']);
});

test('assignmentPlan skips facet-driven ancestors and does not touch ancestors on removal', () => {
  const plan = assignmentPlan(tree, '20', { add: ['96'], remove: ['94'] });
  // 96 gets a new product-id filter; 43 is facet-driven so it is left alone; 94 loses the id
  assert.deepEqual(
    plan.map((p) => p.collectionId),
    ['96', '94'],
  );
  assert.deepEqual(plan[1].filters, []);
});

test('assignmentPlan never updates the same collection twice', () => {
  const plan = assignmentPlan(tree, '5', { add: ['58', '57'], remove: [] });
  assert.deepEqual(
    plan.map((p) => p.collectionId),
    ['58', '57', '2'],
  );
});

test('flattenTree returns parents before their children with a depth', () => {
  const flat = flattenTree(tree);
  assert.deepEqual(
    flat.map((c) => `${c.depth}:${c.id}`),
    ['0:2', '1:57', '2:58', '0:43', '1:94', '1:96'],
  );
});

function toStored(f: { code: string; arguments: { name: string; value: string }[] }) {
  return { code: f.code, args: f.arguments };
}
