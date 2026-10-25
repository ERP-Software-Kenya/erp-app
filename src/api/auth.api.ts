import { apiClient } from './client';
import type { AuthProfile } from '../store/auth.store';

export interface DeviceSessionRequest {
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion?: string;
}

export async function syncUserApi(): Promise<void> {
  await apiClient.post('/v1/auth/sync');
}

export async function getMeApi(): Promise<AuthProfile> {
  const response = await apiClient.get<AuthProfile>('/v1/auth/me');
  return response.data;
}

export async function upsertDeviceSessionApi(device: DeviceSessionRequest): Promise<void> {
  await apiClient.post('/v1/auth/sessions', device);
}

export async function endCurrentSessionApi(): Promise<void> {
  await apiClient.post('/v1/auth/sessions/current/end');
}

export async function registerDeviceTokenApi(expoPushToken: string): Promise<void> {
  await apiClient.post('/v1/notifications/register-device', {
    token: expoPushToken,
    platform: 'expo',
  });
}
