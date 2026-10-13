// The product page must render every option group a product's variants carry
// (the catalogue names shoe sizes "Pointure" / "Pointeurs", clothes "Taille",
// "Tailles", "Taille." ...) and only add to cart once each group has a choice.
// Run: pnpm --filter @oscar/frontend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  optionGroupsOf,
  isSizeGroup,
  initialSelections,
  matchVariant,
  missingGroup,
  sizeNamesOf,
} from './variant-options';

const opt = (group: string, groupName: string, code: string, name = code) => ({
  code,
  name,
  group: { code: group, name: groupName },
});

const shoes = [
  { id: 'v40', options: [opt('pointure', 'Pointure', '40')] },
  { id: 'v41', options: [opt('pointure', 'Pointure', '41')] },
  { id: 'v39', options: [opt('pointure', 'Pointure', '39')] },
];

const clothes = [
  { id: 'm-black', options: [opt('couleur-', 'Couleur', 'noir', 'Noir'), opt('taille-', 'Taille', 'm', 'M')] },
  { id: 's-black', options: [opt('couleur-', 'Couleur', 'noir', 'Noir'), opt('taille-', 'Taille', 's', 'S')] },
  { id: 'm-white', options: [opt('couleur-', 'Couleur', 'blanc', 'Blanc'), opt('taille-', 'Taille', 'm', 'M')] },
];

test('recognises every spelling the catalogue uses for a size group', () => {
  for (const g of [
    { code: 'pointure', name: 'Pointure' },
    { code: 'pointeurs', name: 'Pointeurs' },
    { code: 'taille-', name: 'Taille' },
    { code: 'tailles', name: 'Tailles' },
    { code: 'taille', name: 'Taille.' },
    { code: 'S', name: 'Taille' },
    { code: 'size', name: 'Size' },
    { code: 'x', name: 'مقاس' },
  ]) {
    assert.equal(isSizeGroup(g), true, `${g.code} | ${g.name}`);
  }
  assert.equal(isSizeGroup({ code: 'couleur', name: 'Couleur' }), false);
  assert.equal(isSizeGroup({ code: 'marque', name: 'Marque' }), false);
});

test('a shoe product exposes its pointure group, sorted numerically, as a size group', () => {
  const groups = optionGroupsOf(shoes);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].code, 'pointure');
  assert.equal(groups[0].kind, 'size');
  assert.deepEqual(
    groups[0].values.map((v) => v.name),
    ['39', '40', '41'],
  );
});

test('size comes before colour, and unknown groups are kept after them', () => {
  const variants = [
    { id: 'a', options: [opt('marque', 'Marque', 'nike', 'Nike'), opt('couleur', 'Couleur', 'noir', 'Noir'), opt('pointeurs', 'Pointeurs', '42')] },
  ];
  assert.deepEqual(
    optionGroupsOf(variants).map((g) => [g.code, g.kind]),
    [
      ['pointeurs', 'size'],
      ['couleur', 'color'],
      ['marque', 'other'],
    ],
  );
});

test('groups with a single value are selected up front, others start empty', () => {
  const variants = [
    { id: 'a', options: [opt('marque', 'Marque', 'nike', 'Nike'), opt('pointure', 'Pointure', '42')] },
    { id: 'b', options: [opt('marque', 'Marque', 'nike', 'Nike'), opt('pointure', 'Pointure', '43')] },
  ];
  assert.deepEqual(initialSelections(optionGroupsOf(variants)), { marque: 'nike' });
});

test('the add-to-cart guard names the first group still without a choice', () => {
  const groups = optionGroupsOf(clothes);
  assert.equal(missingGroup(groups, {})?.code, 'taille-');
  assert.equal(missingGroup(groups, { 'taille-': 'm' })?.code, 'couleur-');
  assert.equal(missingGroup(groups, { 'taille-': 'm', 'couleur-': 'noir' }), undefined);
});

test('matchVariant honours every selected group and tolerates unselected ones', () => {
  assert.equal(matchVariant(clothes, { 'taille-': 'm', 'couleur-': 'blanc' })?.id, 'm-white');
  assert.equal(matchVariant(clothes, { 'couleur-': 'blanc' })?.id, 'm-white');
  assert.equal(matchVariant(clothes, {})?.id, 'm-black');
  assert.equal(matchVariant(clothes, { 'taille-': 's', 'couleur-': 'blanc' }), undefined);
  assert.equal(matchVariant(shoes, { pointure: '41' })?.id, 'v41');
});

test('the listing size filter collects pointures alongside clothing sizes, in wearable order', () => {
  const products = [
    { variants: clothes },
    { variants: shoes },
    { variants: [{ id: 'x', options: [opt('tailles', 'Tailles', 'xl', 'XL'), opt('marque', 'Marque', 'nike', 'Nike')] }] },
  ];
  assert.deepEqual(sizeNamesOf(products), ['S', 'M', 'XL', '39', '40', '41']);
});
