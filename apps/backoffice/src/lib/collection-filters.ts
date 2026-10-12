/**
 * Pure helpers for editing Vendure collection filters from the product pages.
 *
 * Collections in this shop are manual product lists: a `product-id-filter`
 * holding a JSON array of product ids. Sub-categories keep `inheritFilters`
 * on, which in Vendure means the child is restricted to products that ALSO
 * match every ancestor's filters. So a product assigned to a child must be in
 * the parents too, or it is silently hidden. `assignmentPlan` enforces that,
 * and every helper keeps the collection's other filters (facet, name...)
 * instead of replacing the whole list.
 */

export interface FilterArg {
  name: string;
  value: string;
}

export interface CollectionFilter {
  code: string;
  args: FilterArg[];
}

/** The ConfigurableOperationInput shape expected by `updateCollection`. */
export interface FilterInput {
  code: string;
  arguments: FilterArg[];
}

export interface CollectionLike {
  id: string;
  parentId?: string | null;
  name?: string;
  filters?: CollectionFilter[] | null;
}

export const PRODUCT_ID_FILTER = 'product-id-filter';
const PRODUCT_IDS_ARG = 'productIds';

function parseIds(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Product ids listed by the collection's product-id filter, if any. */
export function productIdsOf(collection: Pick<CollectionLike, 'filters'>): string[] {
  const filter = (collection.filters ?? []).find((f) => f.code === PRODUCT_ID_FILTER);
  return parseIds(filter?.args?.find((a) => a.name === PRODUCT_IDS_ARG)?.value);
}

function toInput(filter: CollectionFilter): FilterInput {
  return { code: filter.code, arguments: filter.args.map((a) => ({ name: a.name, value: a.value })) };
}

function replaceIds(filter: CollectionFilter, ids: string[]): CollectionFilter {
  return {
    code: filter.code,
    args: filter.args.map((a) => (a.name === PRODUCT_IDS_ARG ? { ...a, value: JSON.stringify(ids) } : a)),
  };
}

/** Filters with `productId` added to the product list; other filters are kept. */
export function withProduct(filters: CollectionFilter[] | null | undefined, productId: string): FilterInput[] {
  const list = filters ?? [];
  const existing = list.find((f) => f.code === PRODUCT_ID_FILTER);
  if (!existing) {
    return [
      ...list.map(toInput),
      {
        code: PRODUCT_ID_FILTER,
        arguments: [
          { name: PRODUCT_IDS_ARG, value: JSON.stringify([productId]) },
          // OR with the other filters: a hand-picked product belongs even if facets disagree.
          { name: 'combineWithAnd', value: 'false' },
        ],
      },
    ];
  }
  const ids = productIdsOf({ filters: list });
  const next = ids.includes(productId) ? ids : [...ids, productId];
  return list.map((f) => toInput(f === existing ? replaceIds(f, next) : f));
}

/** Filters with `productId` removed; an emptied product-id filter is dropped, other filters kept. */
export function withoutProduct(filters: CollectionFilter[] | null | undefined, productId: string): FilterInput[] {
  const list = filters ?? [];
  const existing = list.find((f) => f.code === PRODUCT_ID_FILTER);
  if (!existing) return list.map(toInput);
  const next = productIdsOf({ filters: list }).filter((id) => id !== productId);
  return list
    .filter((f) => f !== existing || next.length > 0)
    .map((f) => toInput(f === existing ? replaceIds(f, next) : f));
}

/** Ancestors of `id`, nearest first, stopping at the (unlisted) root. */
export function ancestorIds(id: string, collections: CollectionLike[]): string[] {
  const byId = new Map(collections.map((c) => [c.id, c]));
  const out: string[] = [];
  let current = byId.get(id);
  const seen = new Set<string>();
  while (current?.parentId && byId.has(current.parentId) && !seen.has(current.parentId)) {
    seen.add(current.parentId);
    out.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return out;
}

/** A manual product list, or no filters at all: safe to add a product id to. */
function isProductList(collection: CollectionLike): boolean {
  const filters = collection.filters ?? [];
  return filters.length === 0 || filters.some((f) => f.code === PRODUCT_ID_FILTER);
}

export interface FilterUpdate {
  collectionId: string;
  filters: FilterInput[];
}

/**
 * Updates needed to add `productId` to `add` collections and remove it from `remove` ones.
 * Adding also adds the product to every product-list ancestor, so inherited filters
 * don't hide it. Removal touches only the chosen collection: the admin may still
 * want the product in the parent.
 */
export function assignmentPlan(
  collections: CollectionLike[],
  productId: string,
  change: { add: string[]; remove: string[] },
): FilterUpdate[] {
  const byId = new Map(collections.map((c) => [c.id, c]));
  const updates: FilterUpdate[] = [];
  const done = new Set<string>();

  const push = (collectionId: string, filters: FilterInput[]) => {
    if (done.has(collectionId)) return;
    done.add(collectionId);
    updates.push({ collectionId, filters });
  };

  for (const id of change.add) {
    const target = byId.get(id);
    if (!target) continue;
    push(id, withProduct(target.filters, productId));
    for (const ancestorId of ancestorIds(id, collections)) {
      const ancestor = byId.get(ancestorId)!;
      if (!isProductList(ancestor) || productIdsOf(ancestor).includes(productId)) continue;
      push(ancestorId, withProduct(ancestor.filters, productId));
    }
  }

  for (const id of change.remove) {
    const target = byId.get(id);
    if (!target) continue;
    push(id, withoutProduct(target.filters, productId));
  }

  return updates;
}

export interface TreeRow<T extends CollectionLike> {
  depth: number;
  id: string;
  collection: T;
}

/** Depth-first flattening in the list's own order: each parent directly before its children. */
export function flattenTree<T extends CollectionLike>(collections: T[]): TreeRow<T>[] {
  const ids = new Set(collections.map((c) => c.id));
  const childrenOf = new Map<string, T[]>();
  const roots: T[] = [];
  for (const c of collections) {
    if (c.parentId && ids.has(c.parentId)) {
      const list = childrenOf.get(c.parentId) ?? [];
      list.push(c);
      childrenOf.set(c.parentId, list);
    } else {
      roots.push(c);
    }
  }
  const out: TreeRow<T>[] = [];
  const visit = (c: T, depth: number) => {
    out.push({ depth, id: c.id, collection: c });
    for (const child of childrenOf.get(c.id) ?? []) visit(child, depth + 1);
  };
  roots.forEach((r) => visit(r, 0));
  return out;
}
