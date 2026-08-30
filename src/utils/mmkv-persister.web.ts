import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';

export function buildMmkvPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient): Promise<void> => {
      localStorage.setItem('queryCache', JSON.stringify(client));
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const cached = localStorage.getItem('queryCache');
      if (!cached) return undefined;
      return JSON.parse(cached) as PersistedClient;
    },
    removeClient: async (): Promise<void> => {
      localStorage.removeItem('queryCache');
    },
  };
}
