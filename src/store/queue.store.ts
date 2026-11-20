import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { apiClient } from '../api/client';

const queueStorage = createMMKV({ id: 'erp-queue' });
const QUEUE_KEY = 'offlineQueue';

export type MutationType = 'claim' | 'pack' | 'gps' | 'tripStatus';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: Record<string, unknown>;
  createdAt: number;
}

interface QueueState {
  queue: QueuedMutation[];
  isFlushing: boolean;
  enqueue: (type: MutationType, payload: Record<string, unknown>) => void;
  flush: () => Promise<void>;
  loadFromStorage: () => void;
  clear: () => void;
}

function persistQueue(queue: QueuedMutation[]): void {
  queueStorage.set(QUEUE_KEY, JSON.stringify(queue));
}

function loadQueue(): QueuedMutation[] {
  const raw = queueStorage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedMutation[];
  } catch {
    return [];
  }
}

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { type, payload } = mutation;
  switch (type) {
    case 'claim':
      await apiClient.post(`/v1/warehouse/orders/${payload.orderId as string}/claim`);
      break;
    case 'pack':
      await apiClient.post(`/v1/warehouse/orders/${payload.orderId as string}/pack`, {
        items: payload.items,
      });
      break;
    case 'gps':
      await apiClient.post(`/v1/field-ops/trips/${payload.tripId as string}/location`, {
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
      });
      break;
    case 'tripStatus':
      await apiClient.patch(`/v1/field-ops/trips/${payload.tripId as string}/status`, {
        status: payload.status,
      });
      break;
  }
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  isFlushing: false,

  loadFromStorage: (): void => {
    set({ queue: loadQueue() });
  },

  clear: (): void => {
    persistQueue([]);
    set({ queue: [], isFlushing: false });
  },

  enqueue: (type: MutationType, payload: Record<string, unknown>): void => {
    const mutation: QueuedMutation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      payload,
      createdAt: Date.now(),
    };
    set((state) => {
      const next = [...state.queue, mutation];
      persistQueue(next);
      return { queue: next };
    });
  },

  flush: async (): Promise<void> => {
    const { queue, isFlushing } = get();
    if (isFlushing || queue.length === 0) return;

    set({ isFlushing: true });
    const remaining: QueuedMutation[] = [];

    for (const mutation of queue) {
      try {
        await executeMutation(mutation);
      } catch {
        remaining.push(mutation);
      }
    }

    persistQueue(remaining);
    set({ queue: remaining, isFlushing: false });
  },
}));
