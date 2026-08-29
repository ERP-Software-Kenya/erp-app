import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { MMKV } from 'react-native-mmkv';
import { router } from 'expo-router';

const authStorage = new MMKV({ id: 'erp-auth' });

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getString('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.delete('jwt');
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  },
);

export { authStorage };
