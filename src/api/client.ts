import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

type GetToken = (options?: { skipCache?: boolean }) => Promise<string | null>;
type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

let getToken: GetToken | null = null;
let onSessionInvalid: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function configureApiAuth(options: {
  getToken: GetToken;
  onSessionInvalid: () => void;
}): () => void {
  getToken = options.getToken;
  onSessionInvalid = options.onSessionInvalid;
  return () => {
    getToken = null;
    onSessionInvalid = null;
  };
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && config && !config._authRetried && getToken) {
      config._authRetried = true;
      refreshPromise ??= getToken({ skipCache: true }).finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(config);
      }
      onSessionInvalid?.();
    }
    return Promise.reject(error);
  },
);
