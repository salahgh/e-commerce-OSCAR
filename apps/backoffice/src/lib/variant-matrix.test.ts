import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMatrix, choose, initialSelection, type MatrixProduct } from './variant-matrix';

const v = (id: string, couleur: string, taille: string, stock: number, extra: Partial<MatrixProduct['variants'][number]> = {}) => ({
  id,
  name: `${couleur} / ${taille}`,
  sku: id,
  enabled: true,
  priceWithTax: 380000,
  stockOnHand: stock,
  stockAllocated: 0,
  trackInventory: 'TRUE',
  options: [
    { id: `c-${couleur}`, code: couleur.toLowerCase(), name: couleur, groupId: 'g-couleur' },
    { id: `t-${taille}`, code: taille.toLowerCase(), name: taille, groupId: 'g-taille' },
  ],
  ...extra,
});

const product: MatrixProduct = {
  optionGroups: [
    { id: 'g-couleur', code: 'couleur', name: 'Couleur' },
    { id: 'g-taille', code: 'taille', name: 'Taille' },
  ],
  variants: [
    v('gris-38', 'Gris', '38', 5),
    v('gris-36', 'Gris', '36', 0),
    v('gris-40', 'Gris', '40', 2),
    v('beige-36', 'Beige', '36', 3),
    v('beige-38', 'Beige', '38', 1, { enabled: false }),
  ],
};

test('groups keep the product order; values are distinct and sizes sorted', () => {
  const m = buildMatrix(product, {});
  assert.deepEqual(m.groups.map((g) => g.name), ['Couleur', 'Taille']);
  assert.deepEqual(m.groups[0].values.map((x) => x.name), ['Gris', 'Beige']);
  assert.deepEqual(m.groups[1].values.map((x) => x.name), ['36', '38', '40']);
  assert.equal(m.variant, null);
});

test('letter sizes are sorted S < M < L < XL', () => {
  const p: MatrixProduct = {
    optionGroups: [{ id: 'g', code: 'taille', name: 'Taille' }],
    variants: ['XL', 'S', 'L', 'M'].map((t) => ({
      id: t, name: t, sku: t, enabled: true, priceWithTax: 1, stockOnHand: 1, stockAllocated: 0, trackInventory: 'TRUE',
      options: [{ id: t, code: t, name: t, groupId: 'g' }],
    })),
  };
  assert.deepEqual(buildMatrix(p, {}).groups[0].values.map((x) => x.name), ['S', 'M', 'L', 'XL']);
});

test('option state follows the other choices: available, out of stock, impossible', () => {
  const m = buildMatrix(product, { 'g-couleur': 'c-Gris' });
  const tailles = Object.fromEntries(m.groups[1].values.map((x) => [x.name, x.state]));
  assert.deepEqual(tailles, { '36': 'out-of-stock', '38': 'available', '40': 'available' });

  const beige = buildMatrix(product, { 'g-couleur': 'c-Beige' });
  const bt = Object.fromEntries(beige.groups[1].values.map((x) => [x.name, x.state]));
  // Beige/38 exists but is disabled; Beige/40 does not exist at all
  assert.deepEqual(bt, { '36': 'available', '38': 'unavailable', '40': 'unavailable' });
});

test('with nothing chosen, an option is available if any variant with it is sellable', () => {
  const m = buildMatrix(product, {});
  const tailles = Object.fromEntries(m.groups[1].values.map((x) => [x.name, x.state]));
  // 36: Gris out of stock but Beige in stock
  assert.deepEqual(tailles, { '36': 'available', '38': 'available', '40': 'available' });
});

test('a full selection resolves the variant with its stock', () => {
  const m = buildMatrix(product, { 'g-couleur': 'c-Gris', 'g-taille': 't-40' });
  assert.equal(m.variant?.id, 'gris-40');
  assert.equal(m.stock, 2);
  assert.equal(m.sellable, true);

  const out = buildMatrix(product, { 'g-couleur': 'c-Gris', 'g-taille': 't-36' });
  assert.equal(out.variant?.id, 'gris-36');
  assert.equal(out.sellable, false);

  const none = buildMatrix(product, { 'g-couleur': 'c-Beige', 'g-taille': 't-40' });
  assert.equal(none.variant, null);
  assert.equal(none.sellable, false);
});

test('untracked inventory is always sellable when enabled', () => {
  const p: MatrixProduct = { ...product, variants: [v('x', 'Gris', '38', 0, { trackInventory: 'FALSE' })] };
  const m = buildMatrix(p, { 'g-couleur': 'c-Gris', 'g-taille': 't-38' });
  assert.equal(m.stock, null);
  assert.equal(m.sellable, true);
});

test('a product without option groups resolves its single variant straight away', () => {
  const p: MatrixProduct = { optionGroups: [], variants: [{ ...v('only', 'Gris', '38', 4), options: [] }] };
  const m = buildMatrix(p, {});
  assert.equal(m.groups.length, 0);
  assert.equal(m.variant?.id, 'only');
});

test('initialSelection: pre-selects a given variant, else auto-picks groups with a single value', () => {
  assert.deepEqual(initialSelection(product, 'gris-38'), { 'g-couleur': 'c-Gris', 'g-taille': 't-38' });
  const oneColour: MatrixProduct = { ...product, variants: product.variants.filter((x) => x.id.startsWith('gris')) };
  assert.deepEqual(initialSelection(oneColour), { 'g-couleur': 'c-Gris' });
  assert.deepEqual(initialSelection(product, 'unknown'), {});
});

test('choose keeps compatible choices and drops the ones that clash', () => {
  // Gris/40 chosen, switch colour to Beige: Beige/40 does not exist → size dropped
  assert.deepEqual(choose(product, { 'g-couleur': 'c-Gris', 'g-taille': 't-40' }, 'g-couleur', 'c-Beige'), { 'g-couleur': 'c-Beige' });
  // Gris/38 chosen, switch to Beige: Beige/38 exists (disabled) → size dropped too, it cannot be sold
  assert.deepEqual(choose(product, { 'g-couleur': 'c-Gris', 'g-taille': 't-38' }, 'g-couleur', 'c-Beige'), { 'g-couleur': 'c-Beige' });
  // Beige/36 chosen, switch to Gris: Gris/36 exists (out of stock) → kept, staff see "Rupture"
  assert.deepEqual(choose(product, { 'g-couleur': 'c-Beige', 'g-taille': 't-36' }, 'g-couleur', 'c-Gris'), { 'g-couleur': 'c-Gris', 'g-taille': 't-36' });
  // clicking the chosen value again clears it
  assert.deepEqual(choose(product, { 'g-couleur': 'c-Gris', 'g-taille': 't-38' }, 'g-taille', 't-38'), { 'g-couleur': 'c-Gris' });
});
