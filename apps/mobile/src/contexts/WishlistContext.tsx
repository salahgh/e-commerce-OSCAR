import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Wishlist is stored per-account so it follows the logged-in user instead of
// leaking across users that share the same device. Signed-out browsing uses a
// separate "guest" bucket.
const STORAGE_PREFIX = 'oscar.wishlist.v1';
const storageKeyFor = (userId?: string | null) => `${STORAGE_PREFIX}:${userId ?? 'guest'}`;

export interface WishlistEntry {
  productId: string;
  slug?: string | null;
  name: string;
  imageUrl?: string | null;
  price?: number;
  currencyCode?: string;
  addedAt: number;
}

interface WishlistContextValue {
  items: WishlistEntry[];
  count: number;
  has: (productId: string) => boolean;
  add: (entry: Omit<WishlistEntry, 'addedAt'>) => void;
  remove: (productId: string) => void;
  toggle: (entry: Omit<WishlistEntry, 'addedAt'>) => void;
  clear: () => void;
  /** True until the persisted list has been hydrated from AsyncStorage. */
  hydrating: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user?.id);
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [hydrating, setHydrating] = useState(true);

  // (Re)hydrate from disk whenever the active account changes — so logging in,
  // out, or switching users loads that user's own wishlist instead of the
  // previous one. Reset to empty first so stale items never flash through.
  useEffect(() => {
    let alive = true;
    setHydrating(true);
    setItems([]);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch (err) {
        console.warn('[wishlist] hydrate failed', err);
      } finally {
        if (alive) setHydrating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storageKey]);

  // Persist on every change AFTER hydration completes (avoid wiping the
  // saved list with the empty initial state).
  useEffect(() => {
    if (hydrating) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(items)).catch((err) => {
      console.warn('[wishlist] persist failed', err);
    });
  }, [items, hydrating, storageKey]);

  const has = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const add = useCallback((entry: Omit<WishlistEntry, 'addedAt'>) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === entry.productId)) return prev;
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const toggle = useCallback((entry: Omit<WishlistEntry, 'addedAt'>) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === entry.productId);
      if (exists) return prev.filter((i) => i.productId !== entry.productId);
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, has, add, remove, toggle, clear, hydrating }),
    [items, has, add, remove, toggle, clear, hydrating],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
};
