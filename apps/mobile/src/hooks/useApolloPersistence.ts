import { useEffect, useState } from 'react';
import { cachePersistor } from '../apollo/client';

/**
 * Restores the persisted Apollo cache once on mount and starts AppState
 * auto-persist. Returns `true` once restore settles (success OR failure) so the
 * splash gate can release — a failed restore must never permanently block the app.
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
