import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useCentrifugo } from '../../src/hooks/useCentrifugo';
import { useQueueStore } from '../../src/store/queue.store';
import { clearActiveTripId, getActiveTripId, setActiveTripId } from '../../src/store/active-trip';
import { DrawerProvider } from '../../src/components/navigation/DrawerContext';
import { DrawerPanel } from '../../src/components/navigation/DrawerPanel';
import { DrawerContent } from '../../src/components/navigation/DrawerContent';

export const GPS_TASK = 'GPS_UPDATE_TASK';

// Define task outside component so it is registered once at module load
TaskManager.defineTask(GPS_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const loc = locations[0];
  if (!loc) return;

  // Access queue store directly (Zustand allows this outside React)
  const { enqueue } = useQueueStore.getState();
  const tripId = getActiveTripId();
  if (!tripId) return;

  enqueue('gps', {
    tripId,
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy ?? 0,
  });
});

export async function startGpsTask(tripId: string): Promise<boolean> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return false;
  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') return false;
  setActiveTripId(tripId);
  const isRunning = await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  if (isRunning) return true;
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
  return true;
}

export async function stopGpsTask(): Promise<void> {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  if (isRunning) await Location.stopLocationUpdatesAsync(GPS_TASK);
  clearActiveTripId();
}

const NAV_ITEMS = [
  { label: 'My Trips', icon: '🚚', href: '/(driver)/' },
  { label: 'Live Map', icon: '🗺️', href: '/(driver)/tracking' },
  { label: 'History', icon: '📋', href: '/(driver)/history' },
  { label: 'Notifications', icon: '🔔', href: '/(shared)/notifications' },
];

function DriverLayoutContent(): React.ReactElement {
  useCentrifugo();

  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b74f5',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#dde5f0' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Trips',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🚚</Text>
              ),
            }}
          />
          <Tabs.Screen name="[tripId]" options={{ href: null }} />
          <Tabs.Screen
            name="tracking"
            options={{
              title: 'Map',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🗺️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>📋</Text>
              ),
            }}
          />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Driver" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}

export default function DriverLayout(): React.ReactElement {
  useEffect(() => {
    return () => {
      void stopGpsTask();
    };
  }, []);

  return <DriverLayoutContent />;
}
