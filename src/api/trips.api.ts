import { apiClient } from './client';

export type TripStatus = 'pending' | 'in_transit' | 'completed';
export type StopStatus = 'pending' | 'current' | 'delivered';

export interface DeliveryStop {
  stopId: string;
  sequence: number;
  customerName: string;
  customerEmail: string;
  address: string;
  latitude: number;
  longitude: number;
  status: StopStatus;
}

export interface Trip {
  id: string;
  tripNumber: string;
  vehiclePlate: string;
  status: TripStatus;
  stops: DeliveryStop[];
  stopCount: number;
  deliveredCount: number;
  createdAt: string;
}

export async function getTodayTripsApi(): Promise<Trip[]> {
  const response = await apiClient.get<Trip[]>('/v1/driver/trips/today');
  return response.data;
}

export async function getTripDetailApi(tripId: string): Promise<Trip> {
  const response = await apiClient.get<Trip>(`/v1/trips/${tripId}`);
  return response.data;
}

export async function updateTripStatusApi(
  tripId: string,
  status: TripStatus,
): Promise<void> {
  await apiClient.patch(`/v1/trips/${tripId}/status`, { status });
}

export async function initiateDeliveryApi(
  tripId: string,
  stopId: string,
): Promise<{ maskedEmail: string }> {
  const response = await apiClient.post<{ maskedEmail: string }>(
    `/v1/trips/${tripId}/stops/${stopId}/initiate-delivery`,
  );
  return response.data;
}

export async function confirmDeliveryApi(
  tripId: string,
  stopId: string,
  otp: string,
): Promise<void> {
  await apiClient.post(`/v1/trips/${tripId}/stops/${stopId}/confirm-delivery`, { otp });
}
