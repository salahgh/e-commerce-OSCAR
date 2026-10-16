import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableStock, buildModification, describeEdits, emptyEdits, lineLabel, type EditableLine, type OrderEdits } from './order-edits';

const variant = (id: string, name: string, productId = 'p1') => ({ id, name, sku: `SKU-${id}`, product: { id: productId } });
const lines: EditableLine[] = [
  { id: 'L1', quantity: 2, productVariant: variant('v-m', 'Pantalon M') },
  { id: 'L2', quantity: 1, productVariant: variant('v-chemise', 'Chemise', 'p2') },
];
const edits = (partial: Partial<OrderEdits>): OrderEdits => ({ ...emptyEdits(), ...partial });

test('no edits means nothing to send', () => {
  assert.equal(buildModification(lines, emptyEdits()), null);
  // quantities equal to the originals are not a change either
  assert.equal(buildModification(lines, edits({ quantities: { L1: 2, L2: 1 } })), null);
});

test('quantity changes only touch the lines that changed; 0 removes', () => {
  assert.deepEqual(buildModification(lines, edits({ quantities: { L1: 3, L2: 0 } })), {
    adjustOrderLines: [
      { orderLineId: 'L1', quantity: 3 },
      { orderLineId: 'L2', quantity: 0 },
    ],
    addItems: undefined,
  });
});

test('a swap removes the line and adds the replacement with the same quantity', () => {
  assert.deepEqual(buildModification(lines, edits({ swaps: { L1: variant('v-l', 'Pantalon L') } })), {
    adjustOrderLines: [{ orderLineId: 'L1', quantity: 0 }],
    addItems: [{ productVariantId: 'v-l', quantity: 2 }],
  });
  // the quantity typed before swapping carries over
  assert.deepEqual(buildModification(lines, edits({ quantities: { L1: 5 }, swaps: { L1: variant('v-l', 'Pantalon L') } })), {
    adjustOrderLines: [{ orderLineId: 'L1', quantity: 0 }],
    addItems: [{ productVariantId: 'v-l', quantity: 5 }],
  });
});

test('adding a variant that already has a line raises that line instead of adding a duplicate', () => {
  assert.deepEqual(buildModification(lines, edits({ additions: [{ variant: variant('v-chemise', 'Chemise', 'p2'), quantity: 2 }] })), {
    adjustOrderLines: [{ orderLineId: 'L2', quantity: 3 }],
    addItems: undefined,
  });
  // ...unless that line is being swapped away
  assert.deepEqual(
    buildModification(
      lines,
      edits({ swaps: { L2: variant('v-other', 'Chemise XL', 'p2') }, additions: [{ variant: variant('v-chemise', 'Chemise', 'p2'), quantity: 2 }] }),
    ),
    {
      adjustOrderLines: [{ orderLineId: 'L2', quantity: 0 }],
      addItems: [
        { productVariantId: 'v-other', quantity: 1 },
        { productVariantId: 'v-chemise', quantity: 2 },
      ],
    },
  );
});

test('the same new variant picked twice is sent once', () => {
  assert.deepEqual(
    buildModification(
      lines,
      edits({
        swaps: { L1: variant('v-l', 'Pantalon L') },
        additions: [
          { variant: variant('v-l', 'Pantalon L'), quantity: 1 },
          { variant: variant('v-l', 'Pantalon L'), quantity: 1 },
        ],
      }),
    ),
    {
      adjustOrderLines: [{ orderLineId: 'L1', quantity: 0 }],
      addItems: [{ productVariantId: 'v-l', quantity: 4 }],
    },
  );
});

test('additions with quantity 0 and negative quantities are ignored', () => {
  assert.equal(buildModification(lines, edits({ additions: [{ variant: variant('v-x', 'X'), quantity: 0 }] })), null);
  assert.deepEqual(buildModification(lines, edits({ quantities: { L1: -4 } })), {
    adjustOrderLines: [{ orderLineId: 'L1', quantity: 0 }],
    addItems: undefined,
  });
});

test('describeEdits summarises the change in French for the history note', () => {
  assert.equal(describeEdits(lines, emptyEdits()), '');
  assert.equal(
    describeEdits(
      lines,
      edits({
        quantities: { L2: 0 },
        swaps: { L1: variant('v-l', 'Pantalon L') },
        additions: [{ variant: variant('v-veste', 'Veste', 'p3'), quantity: 2 }],
      }),
    ),
    'Pantalon M → Pantalon L ; Chemise retiré ; + 2 × Veste',
  );
  assert.equal(describeEdits(lines, edits({ quantities: { L1: 3 } })), 'Pantalon M : 2 → 3');
});

test('availableStock: untracked variants are unlimited, tracked ones subtract allocations', () => {
  assert.equal(availableStock({ trackInventory: 'FALSE', stockOnHand: 0, stockAllocated: 0 }), null);
  assert.equal(availableStock({ trackInventory: 'TRUE', stockOnHand: 5, stockAllocated: 2 }), 3);
  assert.equal(availableStock({ trackInventory: 'INHERIT', stockOnHand: 1, stockAllocated: 4 }), 0);
});

test('lineLabel prefixes the product name when the variant name lacks it', () => {
  assert.equal(lineLabel({ id: 'L', quantity: 1, productVariant: { id: 'v', name: 'Gris / 38', product: { id: 'p', name: 'Basket' } } }), 'Basket – Gris / 38');
  assert.equal(lineLabel({ id: 'L', quantity: 1, productVariant: { id: 'v', name: 'Basket Gris 38', product: { id: 'p', name: 'Basket' } } }), 'Basket Gris 38');
  assert.equal(lineLabel({ id: 'L', quantity: 1, productVariant: { id: 'v', name: 'Pantalon M' } }), 'Pantalon M');
  assert.equal(lineLabel({ id: 'L', quantity: 1, productVariant: null }), 'Ligne L');
});
