import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
  return response.data;
}

export async function registerDeviceTokenApi(expoPushToken: string): Promise<void> {
  await apiClient.post('/v1/notifications/register-device', {
    token: expoPushToken,
    platform: 'expo',
  });
}
