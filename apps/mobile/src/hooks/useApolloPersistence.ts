import { useEffect, useState } from 'react';
import { cachePersistor } from '../apollo/client';

/**
 * Restores the persisted Apollo cache once on mount and starts AppState
 * auto-persist. Returns `true` once restore settles (success OR failure) so the
 * splash gate can release — a failed restore must never permanently block the app.
 *
 * Uses the `cachePersistor` module singleton (not Apollo React context), so it is
 * intentionally mounted in `RootLayout` ABOVE `<ApolloProvider>`: the cache must be
 * restored before any query runs. Do not move it inside the providers.
 */
export function useApolloPersistence(): boolean {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let mounted = true;
    cachePersistor.restore().finally(() => {
      if (mounted) setRestored(true);
    });
    const stop = cachePersistor.start();
    return () => {
      mounted = false;
      stop();
    };
  }, []);

  return restored;
}
