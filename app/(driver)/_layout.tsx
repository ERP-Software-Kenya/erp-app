import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useCentrifugo } from '../../src/hooks/useCentrifugo';
import { useQueueStore } from '../../src/store/queue.store';
import { useAuthStore } from '../../src/store/auth.store';

export const GPS_TASK = 'GPS_UPDATE_TASK';

// Define task outside component so it is registered once at module load
TaskManager.defineTask(GPS_TASK, ({ data, error }) => {
  if (error) return;
  if (!data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const loc = locations[0];
  if (!loc) return;

  // Access queue store directly (Zustand allows this outside React)
  const { enqueue } = useQueueStore.getState();
  const { userId } = useAuthStore.getState();
  if (!userId) return;

  enqueue('gps', {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy ?? 0,
    userId,
  });
});

function DriverLayoutContent(): React.ReactElement {
  useCentrifugo();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b74f5',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#dde5f0' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Deliveries' }} />
      <Tabs.Screen name="[tripId]" options={{ href: null }} />
      <Tabs.Screen name="tracking" options={{ title: 'Tracking' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}

export async function startGpsTask(tripId: string): Promise<void> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') return;
  const isRunning = await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  if (isRunning) return;
  await Location.startLocationUpdatesAsync(GPS_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10_000,
    distanceInterval: 20,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'ERP Field',
      notificationBody: `Tracking trip ${tripId}`,
      notificationColor: '#3b74f5',
    },
  });
}

export async function stopGpsTask(): Promise<void> {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  if (!isRunning) return;
  await Location.stopLocationUpdatesAsync(GPS_TASK);
}

export default function DriverLayout(): React.ReactElement {
  useEffect(() => {
    return () => {
      void stopGpsTask();
    };
  }, []);

  return <DriverLayoutContent />;
}
