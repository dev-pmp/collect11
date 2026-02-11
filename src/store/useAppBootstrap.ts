import { useEffect, useState } from 'react';
import { initLocalDb } from '../data/localDb';
import { useAppStore } from './useAppStore';

export function useAppBootstrap() {
  const [ready, setReady] = useState(false);
  const initialize = useAppStore((s) => s.initialize);

  useEffect(() => {
    (async () => {
      initLocalDb();
      await initialize();
      setReady(true);
    })();
  }, [initialize]);

  return ready;
}
