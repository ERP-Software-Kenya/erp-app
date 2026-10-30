import '../global.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { ClerkProvider, useAuth, useClerk } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { ActivityIndicator, AppState, Text, TouchableOpacity, View, type AppStateStatus } from 'react-native';
import { buildMmkvPersister } from '../src/utils/mmkv-persister';
import { useAuthStore } from '../src/store/auth.store';
import {
  getMeApi,
  registerDeviceTokenApi,
  syncUserApi,
  upsertDeviceSessionApi,
} from '../src/api/auth.api';
import { configureApiAuth } from '../src/api/client';
import { getDeviceSession } from '../src/auth/device-session';
import { useQueueStore } from '../src/store/queue.store';
import { clearActiveTripId } from '../src/store/active-trip';
import { getPendingInvitationToken } from '../src/auth/pending-invitation';

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
  const segments = useSegments();
  const isInviteRoute = (segments as readonly string[]).includes('invite');
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const { isReady, role, setProfile, markReady, clearAuth } = useAuthStore();
  const { loadFromStorage, flush, clear: clearQueue } = useQueueStore();
  const appState = useRef(AppState.currentState);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const bootstrap = useCallback(async (): Promise<void> => {
    if (!isSignedIn) {
      queryClient.clear();
      await persister.removeClient();
      clearQueue();
      clearActiveTripId();
      clearAuth();
      return;
    }
    setBootstrapError(null);
    await syncUserApi();
    const profile = await getMeApi();
    if (!profile.roles.some((role) => role === 'packer' || role === 'driver')) {
      throw new Error('This account is not assigned as a packer or driver.');
    }
    setProfile(profile);
    await upsertDeviceSessionApi(await getDeviceSession());
    await registerExpoToken();
    await flush();
  }, [isSignedIn, clearAuth, clearQueue, setProfile, flush]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) void flush();
  }), [flush]);

  useEffect(() => configureApiAuth({
    getToken,
    onSessionInvalid: () => {
      clearAuth();
      void signOut();
    },
  }), [getToken, clearAuth, signOut]);

  useEffect(() => {
    if (!isLoaded || isInviteRoute) return;
    void getPendingInvitationToken().then((token) => {
      if (token) router.replace(`/(auth)/invite/${encodeURIComponent(token)}` as never);
    });
  }, [isLoaded, isInviteRoute]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isInviteRoute) {
      markReady();
      return;
    }
    void bootstrap().catch((error: unknown) => {
      markReady();
      setBootstrapError(error instanceof Error ? error.message : 'Unable to load your account.');
    });
  }, [isLoaded, isInviteRoute, bootstrap, markReady]);

  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(() => {
      void getDeviceSession()
        .then((device) => upsertDeviceSessionApi(device))
        .catch(() => undefined);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const returning = appState.current.match(/background|inactive/) && nextState === 'active';
      appState.current = nextState;
      if (!returning) return;
      void getToken({ skipCache: true })
        .then((token) => token ? bootstrap() : undefined)
        .catch(() => undefined);
    });
    return () => subscription.remove();
  }, [isSignedIn, getToken, bootstrap]);

  useEffect(() => {
    if (!isLoaded || !isReady || bootstrapError) return;
    if (isInviteRoute) return;
    if (!isSignedIn) {
      router.replace('/(auth)/login');
      return;
    }
    if (role === 'packer') {
      router.replace('/(picker)');
    } else if (role === 'driver') {
      router.replace('/(driver)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLoaded, isReady, isSignedIn, role, bootstrapError, isInviteRoute]);

  if (!isLoaded || !isReady) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" /></View>;
  }

  if (isSignedIn && bootstrapError) {
    return (
      <View className="flex-1 items-center justify-center px-8 bg-surface">
        <Text className="text-text font-bold text-xl mb-2">Account unavailable</Text>
        <Text className="text-muted text-center mb-6">{bootstrapError}</Text>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-xl" onPress={() => void bootstrap()}>
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required');
  }
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </ClerkProvider>
  );
}
