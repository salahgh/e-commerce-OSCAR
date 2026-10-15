import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planRepairs, type RepairCollection } from './collection-repair';

const ids = (list: string[]) => ({
  code: 'product-id-filter',
  args: [{ name: 'productIds', value: JSON.stringify(list) }],
});
const col = (c: Partial<RepairCollection> & { id: string; name: string }): RepairCollection => ({
  parentId: '1',
  isPrivate: false,
  inheritFilters: true,
  filters: [],
  translations: [{ languageCode: 'fr', name: c.name, slug: c.id, description: '' }],
  slug: c.id,
  ...c,
});

const existing = new Set(['10', '11', '20', '21', '22', '30']);

test('prunes ids of products that no longer exist', () => {
  const plan = planRepairs([col({ id: 'men', name: 'Homme', filters: [ids(['10', '999'])] })], existing);
  const update = plan.actions.find((a) => a.type === 'update-filters' && a.id === 'men');
  assert.ok(update && update.type === 'update-filters');
  assert.deepEqual(JSON.parse(update.filters[0].arguments[0].value), ['10']);
  assert.match(update.reason, /999/);
});

test('adds a child list into every product-list ancestor so inherited filters do not hide products', () => {
  const plan = planRepairs(
    [
      col({ id: 'cos', name: 'Cosmétique', filters: [ids(['20'])] }),
      col({ id: 'sham', name: 'Shampoings', parentId: 'cos', filters: [ids(['20', '21', '22'])] }),
      col({ id: 'deep', name: 'Deep', parentId: 'sham', filters: [ids(['30'])] }),
    ],
    existing,
  );
  const cos = plan.actions.find((a) => a.type === 'update-filters' && a.id === 'cos');
  const sham = plan.actions.find((a) => a.type === 'update-filters' && a.id === 'sham');
  assert.ok(cos && cos.type === 'update-filters');
  assert.deepEqual(JSON.parse(cos.filters[0].arguments[0].value), ['20', '21', '22', '30']);
  assert.ok(sham && sham.type === 'update-filters');
  assert.deepEqual(JSON.parse(sham.filters[0].arguments[0].value), ['20', '21', '22', '30']);
  // the leaf needs no change
  assert.equal(plan.actions.some((a) => a.type === 'update-filters' && a.id === 'deep'), false);
});

test('does not propagate into facet-driven ancestors or from children that do not inherit', () => {
  const facet = { code: 'facet-value-filter', args: [{ name: 'facetValueIds', value: '["1"]' }] };
  const plan = planRepairs(
    [
      col({ id: 'cos', name: 'Cosmétique', filters: [facet] }),
      col({ id: 'sham', name: 'Shampoings', parentId: 'cos', filters: [ids(['20'])] }),
      col({ id: 'men', name: 'Homme', filters: [ids(['10'])] }),
      col({ id: 'free', name: 'Free', parentId: 'men', inheritFilters: false, filters: [ids(['11'])] }),
    ],
    existing,
  );
  assert.deepEqual(plan.actions.filter((a) => a.type === 'update-filters'), []);
});

test('stops inheritance on sub-categories that show the whole parent', () => {
  const orIds = (list: string[]) => ({
    code: 'product-id-filter',
    args: [
      { name: 'productIds', value: JSON.stringify(list) },
      { name: 'combineWithAnd', value: 'false' },
    ],
  });
  const plan = planRepairs(
    [
      col({ id: 'cos', name: 'Cosmétique', filters: [ids(['20', '21'])] }),
      // no filter of its own: Vendure gives it every product of the parent
      col({ id: 'hair', name: 'Hair color', parentId: 'cos' }),
      // OR-ed product list: parent's products UNION its own
      col({ id: 'sham', name: 'Shampoings', parentId: 'cos', filters: [orIds(['21'])] }),
      // AND-ed list and non-inheriting children are fine
      col({ id: 'gel', name: 'Gel', parentId: 'cos', filters: [ids(['20'])] }),
      col({ id: 'free', name: 'Free', parentId: 'cos', inheritFilters: false }),
      // top-level: no parent to leak from
      col({ id: 'top', name: 'Top', filters: [orIds(['10'])] }),
    ],
    existing,
  );
  assert.deepEqual(
    plan.actions.filter((a) => a.type === 'stop-inheriting'),
    [
      { type: 'stop-inheriting', id: 'hair', name: 'Hair color', filters: [], reason: 'no filter of its own: it shows the whole parent' },
      {
        type: 'stop-inheriting',
        id: 'sham',
        name: 'Shampoings',
        // re-sent so Vendure recomputes the contents
        filters: [{ code: 'product-id-filter', arguments: [{ name: 'productIds', value: '["21"]' }, { name: 'combineWithAnd', value: 'false' }] }],
        reason: 'its product list is OR-ed with the parent: it shows the whole parent',
      },
    ],
  );
  assert.equal(plan.actions.some((a) => a.type === 'set-private'), false);
});

test('hides a top-level category whose products no longer exist', () => {
  const plan = planRepairs([col({ id: 'kids', name: 'Enfant', filters: [ids(['999'])] })], existing);
  assert.ok(plan.actions.some((a) => a.type === 'set-private' && a.id === 'kids' && a.isPrivate === true));
});

test('publishes a private parent that has a public child', () => {
  const plan = planRepairs(
    [
      col({ id: 'men', name: 'Homme', filters: [ids(['10'])] }),
      col({ id: 'shorts', name: 'Shorts', parentId: 'men', isPrivate: true, filters: [ids(['10'])] }),
      col({ id: 'lin', name: 'short lin', parentId: 'shorts', filters: [ids(['10'])] }),
    ],
    existing,
  );
  assert.ok(plan.actions.some((a) => a.type === 'set-private' && a.id === 'shorts' && a.isPrivate === false));
});

test('trims and collapses whitespace in every translation, leaving slugs alone', () => {
  const plan = planRepairs(
    [
      col({
        id: 'ens',
        name: 'ensemble  en lin ',
        translations: [
          { languageCode: 'fr', name: 'ensemble  en lin ', slug: 'ens', description: ' x ' },
          { languageCode: 'ar', name: ' طقم ', slug: 'ens', description: '' },
        ],
      }),
      col({ id: 'ok', name: 'Clean' }),
    ],
    existing,
  );
  assert.deepEqual(
    plan.actions.filter((a) => a.type === 'rename'),
    [
      {
        type: 'rename',
        id: 'ens',
        name: 'ensemble  en lin ',
        translations: [
          { languageCode: 'fr', name: 'ensemble en lin', slug: 'ens', description: 'x' },
          { languageCode: 'ar', name: 'طقم', slug: 'ens', description: '' },
        ],
        reason: 'stray whitespace in the name',
      },
    ],
  );
});

test('reports products in no collection and missing translations without acting on them', () => {
  const plan = planRepairs(
    [col({ id: 'men', name: 'Homme', filters: [ids(['10'])] })],
    new Set(['10', '11']),
  );
  assert.deepEqual(plan.report.productsInNoCollection, ['11']);
  assert.deepEqual(plan.report.missingTranslations, [{ id: 'men', name: 'Homme', missing: ['ar', 'en'] }]);
});
