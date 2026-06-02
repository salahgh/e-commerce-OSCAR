import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addRecent, RecentlyViewedEntry } from '../utils/recentlyViewed';

const STORAGE_KEY = 'oscar.recentlyViewed.v1';

interface RecentlyViewedContextValue {
  items: RecentlyViewedEntry[];
  track: (entry: Omit<RecentlyViewedEntry, 'viewedAt'>) => void;
  clear: () => void;
  /** True until the persisted list has been hydrated from AsyncStorage. */
  hydrating: boolean;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([]);
  const [hydrating, setHydrating] = useState(true);

  // Hydrate from disk on mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch (err) {
        console.warn('[recentlyViewed] hydrate failed', err);
      } finally {
        if (alive) setHydrating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persist after hydration (avoid wiping the saved list with the empty initial state).
  useEffect(() => {
    if (hydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch((err) => {
      console.warn('[recentlyViewed] persist failed', err);
    });
  }, [items, hydrating]);

  const track = useCallback((entry: Omit<RecentlyViewedEntry, 'viewedAt'>) => {
    setItems((prev) => addRecent(prev, { ...entry, viewedAt: Date.now() }));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<RecentlyViewedContextValue>(
    () => ({ items, track, clear, hydrating }),
    [items, track, clear, hydrating],
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
};

export const useRecentlyViewed = () => {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used inside <RecentlyViewedProvider>');
  return ctx;
};
