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
import { useTodayTrips, useUpdateTripStatus } from '../../src/hooks/useTrips';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { AppHeader } from '../../src/components/common/AppHeader';
import { EmptyState } from '../../src/components/common/EmptyState';
import { startGpsTask, stopGpsTask } from './_layout';
import type { Trip } from '../../src/api/trips.api';

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard(): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <View style={{ width: 120, height: 16, borderRadius: 8, backgroundColor: '#f0f4f8' }} />
          <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: '#f0f4f8', marginTop: 6 }} />
        </View>
        <View style={{ width: 60, height: 26, borderRadius: 13, backgroundColor: '#f0f4f8' }} />
      </View>
      <View style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: '#f0f4f8', marginBottom: 16 }} />
      <View style={{ height: 44, borderRadius: 12, backgroundColor: '#f0f4f8' }} />
    </View>
  );
}

// ── Trip card ──────────────────────────────────────────────────────────────────
interface TripCardProps {
  trip: Trip;
  onStart: (tripId: string) => void;
  isStarting: boolean;
}

function TripCard({ trip, onStart, isStarting }: TripCardProps): React.ReactElement {
  const firstStop = trip.stops[0];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        shadowColor: '#1e3a5f',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <View style={{ height: 3, backgroundColor: '#3b74f5' }} />

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 }}>
              Trip #{trip.tripNumber}
            </Text>
            {trip.vehiclePlate ? (
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                {trip.vehiclePlate}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              backgroundColor: '#eff6ff',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: '#3b74f5', fontSize: 12, fontWeight: '700' }}>
              {trip.stopCount} stop{trip.stopCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* First customer */}
        {firstStop ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 8 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                First Stop
              </Text>
              <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: '600', marginTop: 1 }}>
                {firstStop.customerName}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Start button */}
        <TouchableOpacity
          onPress={() => onStart(trip.id)}
          disabled={isStarting}
          activeOpacity={0.85}
          style={{
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isStarting ? '#93c5fd' : '#3b74f5',
          }}
        >
          {isStarting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>
              Start Trip  →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function DriverIndexScreen(): React.ReactElement {
  const { data: trips, isLoading, refetch, isRefetching } = useTodayTrips();
  const updateStatus = useUpdateTripStatus();
  const [startingId, setStartingId] = React.useState<string | null>(null);

  const activeCount = trips?.filter((t) => t.status === 'in_transit').length ?? 0;
  const deliveredCount = trips?.reduce((sum, t) => sum + (t.deliveredCount ?? 0), 0) ?? 0;
  const totalStops = trips?.reduce((sum, t) => sum + (t.stopCount ?? 0), 0) ?? 0;

  const handleStart = useCallback(
    async (tripId: string): Promise<void> => {
      setStartingId(tripId);
      try {
        const trackingStarted = await startGpsTask(tripId);
        if (!trackingStarted) {
          Alert.alert(
            'Location required',
            'Background location permission is required to start a delivery trip.',
          );
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
      <TripCard trip={item} onStart={handleStart} isStarting={startingId === item.id} />
    ),
    [handleStart, startingId],
  );

  const tripCount = trips?.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <OfflineBanner />

      <AppHeader
        title="Today's Deliveries"
        subtitle={`${tripCount} trip${tripCount !== 1 ? 's' : ''} assigned`}
      />

      {/* Stats strip */}
      <View
        style={{
          backgroundColor: '#0d1b3e',
          flexDirection: 'row',
          paddingVertical: 16,
          paddingHorizontal: 8,
        }}
      >
        {[
          { label: 'Active', value: String(activeCount), accent: '#3b74f5' },
          { label: 'Delivered', value: String(deliveredCount), accent: '#22c55e' },
          { label: 'Total Stops', value: String(totalStops), accent: '#f59e0b' },
        ].map((stat, idx) => (
          <View key={stat.label} style={{ flex: 1, alignItems: 'center' }}>
            {idx > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  bottom: 4,
                  width: 1,
                  backgroundColor: '#1e3a5f',
                }}
              />
            ) : null}
            <Text style={{ color: stat.accent, fontWeight: '900', fontSize: 26 }}>
              {stat.value}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 8 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlashList
          data={trips ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              icon="🚚"
              title="No trips today"
              subtitle="Your assigned trips will appear here"
            />
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        />
      )}
    </View>
  );
}
