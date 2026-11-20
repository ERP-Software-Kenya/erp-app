import { createMMKV } from 'react-native-mmkv';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';

export const storage = createMMKV({ id: 'erp-query-cache' });

export function buildMmkvPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient): Promise<void> => {
      storage.set('queryCache', JSON.stringify(client));
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const cached = storage.getString('queryCache');
      if (!cached) return undefined;
      return JSON.parse(cached) as PersistedClient;
    },
    removeClient: async (): Promise<void> => {
      storage.remove('queryCache');
    },
  };
}
