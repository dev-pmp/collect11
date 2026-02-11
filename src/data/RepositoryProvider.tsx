import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { IRepository } from './repositories/IRepository';
import { LocalRepository } from './repositories/LocalRepository';
import { CloudRepository } from './repositories/CloudRepository';

const RepositoryContext = createContext<IRepository | null>(null);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppStore((s) => s.mode);
  const localUserId = useAppStore((s) => s.localUserId);
  const session = useAppStore((s) => s.session);

  const repo = useMemo(() => {
    if (mode === 'cloud' && session?.user.id) {
      return new CloudRepository(session.user.id);
    }
    return new LocalRepository(localUserId);
  }, [mode, localUserId, session?.user.id]);

  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>;
}

export function useRepository() {
  const repo = useContext(RepositoryContext);
  if (!repo) throw new Error('useRepository must be used within RepositoryProvider');
  return repo;
}
