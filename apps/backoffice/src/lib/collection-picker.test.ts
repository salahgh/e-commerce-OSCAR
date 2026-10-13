// Pure logic behind the category picker on the product pages: full paths,
// accent-insensitive search and which branches to open. Run:
// pnpm --filter @oscar/backoffice test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionPath, matchingIds, ancestorsOf, childrenMap, normalizeText } from './collection-picker';

const tree = [
  { id: '1', name: 'Homme', parentId: null },
  { id: '2', name: 'Chaussures', parentId: '1' },
  { id: '3', name: 'Baskets', parentId: '2' },
  { id: '4', name: 'Femme', parentId: null },
  { id: '5', name: 'Baskets', parentId: '4' },
  { id: '6', name: 'Vêtements bébé', parentId: null },
  { id: '7', name: 'Orphan', parentId: 'missing' },
];

test('collectionPath lists the names from the root down to the category', () => {
  assert.deepEqual(collectionPath(tree, '3'), ['Homme', 'Chaussures', 'Baskets']);
  assert.deepEqual(collectionPath(tree, '5'), ['Femme', 'Baskets']);
  assert.deepEqual(collectionPath(tree, '1'), ['Homme']);
  assert.deepEqual(collectionPath(tree, '7'), ['Orphan']);
  assert.deepEqual(collectionPath(tree, 'nope'), []);
});

test('normalizeText ignores case and accents', () => {
  assert.equal(normalizeText('Vêtements Bébé'), 'vetements bebe');
});

test('matchingIds finds names regardless of case and accents, empty query matches nothing', () => {
  assert.deepEqual([...matchingIds(tree, 'basket')].sort(), ['3', '5']);
  assert.deepEqual([...matchingIds(tree, 'VETEMENT')], ['6']);
  assert.deepEqual([...matchingIds(tree, '  ')], []);
  assert.deepEqual([...matchingIds(tree, 'zzz')], []);
});

test('ancestorsOf returns every ancestor of the given ids, without the ids themselves', () => {
  assert.deepEqual([...ancestorsOf(tree, ['3'])].sort(), ['1', '2']);
  assert.deepEqual([...ancestorsOf(tree, ['3', '5'])].sort(), ['1', '2', '4']);
  assert.deepEqual([...ancestorsOf(tree, ['1'])], []);
  assert.deepEqual([...ancestorsOf(tree, ['7'])], []);
});

test('childrenMap groups children under their parent in list order and treats orphans as roots', () => {
  const m = childrenMap(tree);
  assert.deepEqual(m.roots.map((c) => c.id), ['1', '4', '6', '7']);
  assert.deepEqual((m.children.get('1') ?? []).map((c) => c.id), ['2']);
  assert.deepEqual((m.children.get('4') ?? []).map((c) => c.id), ['5']);
  assert.equal(m.children.has('3'), false);
});
