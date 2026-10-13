import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import {
  ancestorsOf,
  childrenMap,
  collectionPath,
  matchingIds,
  type PickerCollection,
} from '../../lib/collection-picker';

export type CategoryPickerCollection = PickerCollection & { slug?: string | null; isPrivate?: boolean | null };

interface CategoryPickerProps {
  collections: CategoryPickerCollection[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Category picker for the product pages: a search box, the selected
 * categories as removable chips with their full path, and a collapsible
 * tree. Branches holding a selection start open; a search opens every
 * branch with a match and hides the rest.
 */
export function CategoryPicker({ collections, selected, onChange }: CategoryPickerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const { roots, children } = useMemo(() => childrenMap(collections), [collections]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const matches = useMemo(() => matchingIds(collections, query), [collections, query]);
  const searching = query.trim().length > 0;

  // Open the branches that hold the current selection whenever it is loaded or
  // changed from outside (initial assignment, chips), never closing what the
  // user opened by hand.
  useEffect(() => {
    const needed = ancestorsOf(collections, selected);
    if (needed.size === 0) return;
    setExpanded((prev) => {
      if ([...needed].every((id) => prev.has(id))) return prev;
      return new Set([...prev, ...needed]);
    });
  }, [collections, selected]);

  // While searching, show a category when it matches or when a descendant does.
  const visible = useMemo(() => {
    if (!searching) return null;
    return new Set([...matches, ...ancestorsOf(collections, matches)]);
  }, [searching, matches, collections]);

  const toggle = (id: string, on: boolean) => {
    onChange(on ? [...selected, id] : selected.filter((s) => s !== id));
  };
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderRows = (list: CategoryPickerCollection[], depth: number): React.ReactNode[] =>
    list.flatMap((c) => {
      if (visible && !visible.has(c.id)) return [];
      const kids = children.get(c.id) ?? [];
      const isOpen = searching || expanded.has(c.id);
      const isSelected = selectedSet.has(c.id);
      const isMatch = matches.has(c.id);
      const row = (
        <div
          key={c.id}
          data-testid="category-row"
          data-depth={depth}
          style={{ paddingInlineStart: 8 + depth * 20 }}
          className={cn(
            'flex items-center gap-2 rounded-md py-1.5 pe-2 transition-colors hover:bg-muted/60',
            isSelected && 'bg-primary/10',
            searching && !isMatch && 'opacity-60',
          )}
        >
          {kids.length > 0 ? (
            <button
              type="button"
              onClick={() => toggleExpanded(c.id)}
              aria-expanded={isOpen}
              aria-label={`${isOpen ? 'Replier' : 'Déplier'} ${c.name ?? ''}`}
              disabled={searching}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
            </button>
          ) : (
            <span className="h-6 w-6 shrink-0" />
          )}
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => toggle(c.id, e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-border bg-card text-primary"
            />
            <span className={cn('truncate text-sm', isSelected ? 'font-medium text-foreground' : 'text-foreground')}>
              {c.name}
            </span>
            {kids.length > 0 && !searching && (
              <span className="shrink-0 text-xs text-muted-foreground">({kids.length})</span>
            )}
            {c.isPrivate && (
              <span className="shrink-0 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-500">privée</span>
            )}
          </label>
        </div>
      );
      return [row, ...(isOpen ? renderRows(kids, depth + 1) : [])];
    });

  const rows = renderRows(roots, 0);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une catégorie…"
        aria-label="Rechercher une catégorie"
        icon={<Search className="h-4 w-4" />}
      />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="selected-categories">
          {selected.map((id) => {
            const path = collectionPath(collections, id);
            if (path.length === 0) return null;
            return (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/15 py-1 pe-1 ps-3 text-xs text-foreground ring-1 ring-primary/30"
              >
                <span className="truncate">{path.join(' › ')}</span>
                <button
                  type="button"
                  onClick={() => toggle(id, false)}
                  aria-label={`Retirer ${path[path.length - 1]}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/20 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-border p-1" role="tree">
        {rows.length > 0 ? (
          rows
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {searching ? `Aucune catégorie ne correspond à « ${query.trim()} »` : 'Aucune catégorie disponible'}
          </p>
        )}
      </div>
    </div>
  );
}
