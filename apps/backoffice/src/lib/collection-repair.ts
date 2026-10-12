/**
 * Plans a one-off repair of the collection tree. Pure: takes the admin-api
 * collections and the ids of products that still exist, returns actions and
 * a report. `scripts/repair-collections.ts` fetches the data, prints the plan
 * and, with --apply, executes it.
 *
 * What it fixes (see the audit of 2026-10-12):
 *  - product-id lists pointing at deleted products
 *  - sub-categories whose products are missing from the parent's list, which
 *    `inheritFilters` turns into hidden products
 *  - public sub-categories with no filter of their own (they show the whole parent)
 *  - top-level categories with nothing left in them
 *  - private parents with a public child (the child is unreachable)
 *  - stray whitespace in names
 * Everything else (products in no category, missing translations) is only reported.
 */

import {
  PRODUCT_ID_FILTER,
  ancestorIds,
  productIdsOf,
  type CollectionFilter,
  type FilterInput,
} from './collection-filters';

export interface RepairTranslation {
  languageCode: string;
  name: string;
  slug: string;
  description: string;
}

export interface RepairCollection {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isPrivate: boolean;
  inheritFilters: boolean;
  filters: CollectionFilter[];
  translations: RepairTranslation[];
}

export type RepairAction =
  | { type: 'update-filters'; id: string; name: string; filters: FilterInput[]; reason: string }
  | { type: 'set-private'; id: string; name: string; isPrivate: boolean; reason: string }
  | { type: 'rename'; id: string; name: string; translations: RepairTranslation[]; reason: string };

export interface RepairReport {
  productsInNoCollection: string[];
  missingTranslations: { id: string; name: string; missing: string[] }[];
}

export interface RepairPlan {
  actions: RepairAction[];
  report: RepairReport;
}

const LANGUAGES = ['fr', 'ar', 'en'];

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

function isProductList(c: RepairCollection): boolean {
  return c.filters.length === 0 || c.filters.some((f) => f.code === PRODUCT_ID_FILTER);
}

function filtersWithIds(filters: CollectionFilter[], ids: string[]): FilterInput[] {
  return filters.map((f) => ({
    code: f.code,
    arguments: f.args.map((a) =>
      f.code === PRODUCT_ID_FILTER && a.name === 'productIds' ? { name: a.name, value: JSON.stringify(ids) } : { name: a.name, value: a.value },
    ),
  }));
}

export function planRepairs(collections: RepairCollection[], existingProductIds: Set<string>): RepairPlan {
  const byId = new Map(collections.map((c) => [c.id, c]));
  const inTree = (id: string | null) => !!id && byId.has(id);
  const actions: RepairAction[] = [];

  // 1. prune deleted products, 2. propagate child lists into product-list ancestors
  const lists = new Map<string, string[]>();
  const reasons = new Map<string, string[]>();
  const note = (id: string, why: string) => reasons.set(id, [...(reasons.get(id) ?? []), why]);

  for (const c of collections) {
    const original = productIdsOf(c);
    const kept = original.filter((id) => existingProductIds.has(id));
    lists.set(c.id, kept);
    const dropped = original.filter((id) => !existingProductIds.has(id));
    if (dropped.length) note(c.id, `removed ${dropped.length} deleted product(s): ${dropped.join(', ')}`);
  }

  for (const c of collections) {
    if (!c.inheritFilters || !c.filters.some((f) => f.code === PRODUCT_ID_FILTER)) continue;
    const mine = lists.get(c.id)!;
    for (const ancestorId of ancestorIds(c.id, collections)) {
      const ancestor = byId.get(ancestorId)!;
      if (!isProductList(ancestor)) continue;
      const theirs = lists.get(ancestorId)!;
      const missing = mine.filter((id) => !theirs.includes(id));
      if (!missing.length) continue;
      lists.set(ancestorId, [...theirs, ...missing]);
      note(ancestorId, `added ${missing.length} product(s) from "${clean(c.name)}" so they are not hidden by inherited filters`);
    }
  }

  for (const c of collections) {
    const why = reasons.get(c.id);
    if (!why) continue;
    const ids = lists.get(c.id)!;
    const hasListFilter = c.filters.some((f) => f.code === PRODUCT_ID_FILTER);
    const filters = hasListFilter
      ? filtersWithIds(c.filters, ids)
      : [...filtersWithIds(c.filters, ids), { code: PRODUCT_ID_FILTER, arguments: [{ name: 'productIds', value: JSON.stringify(ids) }, { name: 'combineWithAnd', value: 'false' }] }];
    actions.push({ type: 'update-filters', id: c.id, name: clean(c.name), filters, reason: why.join('; ') });
  }

  // 3. public sub-category with no own filter shows the entire parent
  for (const c of collections) {
    if (!c.isPrivate && c.inheritFilters && c.filters.length === 0 && inTree(c.parentId)) {
      actions.push({ type: 'set-private', id: c.id, name: clean(c.name), isPrivate: true, reason: 'no filter of its own: it shows the whole parent' });
    }
  }

  // 4. top-level category with nothing left in it
  for (const c of collections) {
    if (inTree(c.parentId) || c.isPrivate) continue;
    const hasChildren = collections.some((o) => o.parentId === c.id);
    if (isProductList(c) && lists.get(c.id)!.length === 0 && !hasChildren) {
      actions.push({ type: 'set-private', id: c.id, name: clean(c.name), isPrivate: true, reason: 'top-level category with no remaining products' });
    }
  }

  // 5. private parent with a public child: the child is unreachable on the storefront
  for (const c of collections) {
    if (!c.isPrivate) continue;
    const publicChildren = collections.filter((o) => o.parentId === c.id && !o.isPrivate);
    if (publicChildren.length) {
      actions.push({ type: 'set-private', id: c.id, name: clean(c.name), isPrivate: false, reason: `private, but its public child(ren) ${publicChildren.map((o) => `"${clean(o.name)}"`).join(', ')} cannot be reached on the storefront` });
    }
  }

  // 6. stray whitespace in names/descriptions
  for (const c of collections) {
    const cleaned = c.translations.map((t) => ({ languageCode: t.languageCode, name: clean(t.name), slug: t.slug, description: clean(t.description ?? '') }));
    const changed = cleaned.some((t, i) => t.name !== c.translations[i].name || t.description !== (c.translations[i].description ?? ''));
    if (changed) actions.push({ type: 'rename', id: c.id, name: c.name, translations: cleaned, reason: 'stray whitespace in the name' });
  }

  // report only
  const covered = new Set<string>();
  for (const ids of lists.values()) ids.forEach((id) => covered.add(id));
  const productsInNoCollection = [...existingProductIds].filter((id) => !covered.has(id));
  const missingTranslations = collections
    .map((c) => ({ id: c.id, name: clean(c.name), missing: LANGUAGES.filter((l) => !c.translations.some((t) => t.languageCode === l && t.name.trim())) }))
    .filter((c) => c.missing.length);

  return { actions, report: { productsInNoCollection, missingTranslations } };
}
