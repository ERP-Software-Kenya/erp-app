import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodayTrips, useUpdateTripStatus } from '../../src/hooks/useTrips';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { startGpsTask, stopGpsTask } from './_layout';
import type { Trip } from '../../src/api/trips.api';

interface TripCardProps {
  trip: Trip;
  onStart: (tripId: string) => void;
  isStarting: boolean;
}

function TripCard({ trip, onStart, isStarting }: TripCardProps): React.ReactElement {
  const firstStop = trip.stops[0];
  return (
    <View className="mx-4 my-2 rounded-2xl bg-white border border-border shadow-sm p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-text font-bold text-base">Trip #{trip.tripNumber}</Text>
          <Text className="text-muted text-sm mt-0.5">{trip.vehiclePlate}</Text>
        </View>
        <View className="bg-primary/10 px-2.5 py-1 rounded-full">
          <Text className="text-primary text-xs font-bold">{trip.stopCount} stops</Text>
        </View>
      </View>

      {firstStop && (
        <Text className="text-muted text-xs mb-3">
          First stop: {firstStop.customerName}
        </Text>
      )}

      <TouchableOpacity
        className={[
          'rounded-xl py-3 items-center',
          isStarting ? 'bg-primary/50' : 'bg-primary',
        ].join(' ')}
        onPress={() => onStart(trip.id)}
        disabled={isStarting}
        activeOpacity={0.85}
      >
        {isStarting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-sm">Start Trip →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function EmptyTrips(): React.ReactElement {
  return (
    <View className="flex-1 items-center justify-center py-24">
      <Text className="text-4xl mb-4">🚚</Text>
      <Text className="text-text font-semibold text-lg">No trips today</Text>
      <Text className="text-muted text-sm mt-1">Your assigned trips will appear here</Text>
    </View>
  );
}

export default function DriverIndexScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: trips, isLoading, refetch, isRefetching } = useTodayTrips();
  const updateStatus = useUpdateTripStatus();
  const [startingId, setStartingId] = React.useState<string | null>(null);

  const handleStart = useCallback(
    async (tripId: string): Promise<void> => {
      setStartingId(tripId);
      try {
        const trackingStarted = await startGpsTask(tripId);
        if (!trackingStarted) {
          Alert.alert('Location required', 'Background location permission is required to start a delivery trip.');
          return;
        }
        await updateStatus.mutateAsync({ tripId, status: 'in_transit' });
        router.push(`/(driver)/${tripId}`);
      } catch {
        await stopGpsTask();
        Alert.alert('Error', 'Could not start trip. Try again.');
      } finally {
        setStartingId(null);
      }
    },
    [updateStatus],
  );

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard
        trip={item}
        onStart={handleStart}
        isStarting={startingId === item.id}
      />
    ),
    [handleStart, startingId],
  );

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <OfflineBanner />
      <View className="px-4 py-4 bg-white border-b border-border">
        <Text className="text-2xl font-bold text-text">Today&apos;s Deliveries</Text>
        <Text className="text-muted text-sm mt-0.5">
          {trips?.length ?? 0} trip{(trips?.length ?? 0) !== 1 ? 's' : ''} assigned
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b74f5" />
        </View>
      ) : (
        <FlashList
          data={trips ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyTrips />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      )}
    </View>
  );
}
