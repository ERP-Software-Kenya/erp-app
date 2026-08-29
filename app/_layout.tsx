import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { buildMmkvPersister } from '../src/utils/mmkv-persister';
import { useAuthStore } from '../src/store/auth.store';
import { registerDeviceTokenApi } from '../src/api/auth.api';
import { useQueueStore } from '../src/store/queue.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persister = buildMmkvPersister();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootNavigator(): React.ReactElement {
  const { hydrate, token, role } = useAuthStore();
  const { loadFromStorage } = useQueueStore();

  useEffect(() => {
    hydrate();
    loadFromStorage();
  }, [hydrate, loadFromStorage]);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    if (role === 'PICKER') {
      router.replace('/(picker)');
    } else if (role === 'DRIVER') {
      router.replace('/(driver)');
    }
  }, [token, role]);

  useEffect(() => {
    if (!token) return;
    void registerExpoToken();
  }, [token]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(picker)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(shared)" />
    </Stack>
  );
}

async function registerExpoToken(): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await registerDeviceTokenApi(tokenData.data);
  } catch {
    // Non-fatal: push registration failure should not crash the app
  }
}

export default function RootLayout(): React.ReactElement {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
