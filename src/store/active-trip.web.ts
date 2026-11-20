const ACTIVE_TRIP_KEY = 'activeTripId';

export function setActiveTripId(tripId: string): void {
  localStorage.setItem(ACTIVE_TRIP_KEY, tripId);
}

export function getActiveTripId(): string | undefined {
  return localStorage.getItem(ACTIVE_TRIP_KEY) ?? undefined;
}

export function clearActiveTripId(): void {
  localStorage.removeItem(ACTIVE_TRIP_KEY);
}
