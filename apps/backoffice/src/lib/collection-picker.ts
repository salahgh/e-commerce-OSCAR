// Pure logic behind the category picker on the product pages (see
// CategoryPicker.tsx): full paths, accent-insensitive search and which
// branches hold a given selection. Tree helpers live in collection-filters.ts.
import type { CollectionLike } from './collection-filters';

export type PickerCollection = CollectionLike & { name?: string; parentId?: string | null };

/** Lower-case, accents stripped: "Vêtements Bébé" → "vetements bebe". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function byId<T extends PickerCollection>(collections: T[]): Map<string, T> {
  return new Map(collections.map((c) => [c.id, c]));
}

/** Names from the root down to `id`; a parent missing from the list ends the path. */
export function collectionPath<T extends PickerCollection>(collections: T[], id: string): string[] {
  const map = byId(collections);
  const names: string[] = [];
  const seen = new Set<string>();
  let cur = map.get(id);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    names.unshift(cur.name ?? '');
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return names;
}

/** Ids whose name contains the query (case- and accent-insensitive); blank query matches nothing. */
export function matchingIds<T extends PickerCollection>(collections: T[], query: string): Set<string> {
  const q = normalizeText(query);
  if (!q) return new Set();
  return new Set(collections.filter((c) => normalizeText(c.name ?? '').includes(q)).map((c) => c.id));
}

/** Every ancestor of the given ids (the ids themselves excluded). */
export function ancestorsOf<T extends PickerCollection>(collections: T[], ids: Iterable<string>): Set<string> {
  const map = byId(collections);
  const out = new Set<string>();
  for (const id of ids) {
    let cur = map.get(id);
    while (cur?.parentId && map.has(cur.parentId) && !out.has(cur.parentId)) {
      out.add(cur.parentId);
      cur = map.get(cur.parentId);
    }
  }
  return out;
}

/** Roots and a parent → children map, both in the list's own order. */
export function childrenMap<T extends PickerCollection>(collections: T[]): { roots: T[]; children: Map<string, T[]> } {
  const ids = new Set(collections.map((c) => c.id));
  const roots: T[] = [];
  const children = new Map<string, T[]>();
  for (const c of collections) {
    if (c.parentId && ids.has(c.parentId)) {
      const list = children.get(c.parentId) ?? [];
      list.push(c);
      children.set(c.parentId, list);
    } else {
      roots.push(c);
    }
  }
  return { roots, children };
}
