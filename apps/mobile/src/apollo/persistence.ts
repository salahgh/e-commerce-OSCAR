/**
 * Minimal in-house Apollo cache persistor.
 *
 * `apollo3-cache-persist` peer-depends on Apollo Client 3 and will not install
 * against this app's AC4, so we persist the cache ourselves using only public
 * AC4 APIs (`cache.extract()` / `cache.restore()`) plus RN `AppState` as the
 * write trigger. Persistence must never crash or block the app — every failure
 * is swallowed with a warning.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import type { InMemoryCache } from '@apollo/client';

const CACHE_KEY = 'oscar-apollo-cache';
const MAX_BYTES = 1024 * 1024; // 1 MB cap

export interface ApolloPersistor {
  restore(): Promise<void>;
  persist(): Promise<void>;
  purge(): Promise<void>;
  /** Begin auto-persisting on app background/inactive. Returns an unsubscribe fn. */
  start(): () => void;
}

export function createPersistor(cache: InMemoryCache): ApolloPersistor {
  const persist = async (): Promise<void> => {
    try {
      const data = JSON.stringify(cache.extract());
      if (data.length > MAX_BYTES) {
        await AsyncStorage.removeItem(CACHE_KEY); // too large — drop rather than store a huge blob
        return;
      }
      await AsyncStorage.setItem(CACHE_KEY, data);
    } catch (e) {
      console.warn('[persist] write failed', e);
    }
  };

  const restore = async (): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) cache.restore(JSON.parse(raw));
    } catch (e) {
      console.warn('[persist] restore failed', e);
    }
  };

  const purge = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (e) {
      console.warn('[persist] purge failed', e);
    }
  };

  const start = (): (() => void) => {
    const onChange = (state: AppStateStatus): void => {
      if (state === 'background' || state === 'inactive') void persist();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  };

  return { restore, persist, purge, start };
}
