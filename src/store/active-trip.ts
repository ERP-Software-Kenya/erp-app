import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'erp-active-trip' });
const ACTIVE_TRIP_KEY = 'activeTripId';

export function setActiveTripId(tripId: string): void {
  storage.set(ACTIVE_TRIP_KEY, tripId);
}

export function getActiveTripId(): string | undefined {
  return storage.getString(ACTIVE_TRIP_KEY);
}

export function clearActiveTripId(): void {
  storage.remove(ACTIVE_TRIP_KEY);
}
