'use client';

import * as React from 'react';

const STORAGE_KEY = 'oscar-wishlist-v1';

export interface WishlistEntry {
  slug: string;
  name: string;
  imageUrl?: string | null;
  price?: number;
  currencyCode?: string;
  addedAt: number;
}

interface WishlistContextValue {
  items: WishlistEntry[];
  count: number;
  has: (slug: string) => boolean;
  add: (entry: Omit<WishlistEntry, 'addedAt'>) => void;
  remove: (slug: string) => void;
  toggle: (entry: Omit<WishlistEntry, 'addedAt'>) => void;
  clear: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | undefined>(undefined);

function loadInitial(): WishlistEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistEntry[]>([]);

  // Hydrate from localStorage on mount (avoid SSR mismatch)
  React.useEffect(() => {
    setItems(loadInitial());
  }, []);

  // Persist on change
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / disabled — swallow
    }
  }, [items]);

  const has = React.useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const add = React.useCallback((entry: Omit<WishlistEntry, 'addedAt'>) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === entry.slug)) return prev;
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const remove = React.useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const toggle = React.useCallback((entry: Omit<WishlistEntry, 'addedAt'>) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === entry.slug);
      if (exists) return prev.filter((i) => i.slug !== entry.slug);
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const value = React.useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, has, add, remove, toggle, clear }),
    [items, has, add, remove, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
