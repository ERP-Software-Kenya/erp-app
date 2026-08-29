import { apiClient } from './client';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function postLocationUpdateApi(
  tripId: string,
  location: LocationUpdate,
): Promise<void> {
  await apiClient.post(`/v1/trips/${tripId}/location`, location);
}

export async function getCentrifugoTokenApi(): Promise<string> {
  const response = await apiClient.get<{ token: string }>(
    '/v1/notifications/centrifugo-token',
  );
  return response.data.token;
}
