import React from 'react';
import {
  View,
  Text,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../../src/components/common/AppHeader';
import { EmptyState } from '../../src/components/common/EmptyState';
import { StatusBadge } from '../../src/components/common/StatusBadge';
import { apiClient } from '../../src/api/client';
import type { Trip } from '../../src/api/trips.api';

// ── History API ───────────────────────────────────────────────────────────────
async function getTripHistoryApi(): Promise<Trip[]> {
  const response = await apiClient.get<Trip[]>('/v1/field-ops/driver/trips/history');
  return response.data;
}

function useTripHistory() {
  return useQuery({
    queryKey: ['trips', 'history'],
    queryFn: getTripHistoryApi,
    staleTime: 60_000,
  });
}

// ── Format date ───────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Trip history card ─────────────────────────────────────────────────────────
interface HistoryCardProps {
  trip: Trip;
}

function HistoryCard({ trip }: HistoryCardProps): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#1e3a5f',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#dde5f0',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <View style={{ height: 3, backgroundColor: '#22c55e' }} />

      <View style={{ padding: 14 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 }}>
              Trip #{trip.tripNumber}
            </Text>
            {trip.vehiclePlate ? (
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                {trip.vehiclePlate}
              </Text>
            ) : null}
          </View>
          <StatusBadge status="delivered" />
        </View>

        {/* Meta row */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 13 }}>📅</Text>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '500' }}>
              {formatDate(trip.createdAt)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 13 }}>📍</Text>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '500' }}>
              {trip.stopCount} stop{trip.stopCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {trip.deliveredCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 13 }}>✅</Text>
              <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '600' }}>
                {trip.deliveredCount} delivered
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DriverHistoryScreen(): React.ReactElement {
  const { data: trips, isLoading, refetch, isRefetching, isError } = useTripHistory();

  const completedTrips = trips?.filter((t) => t.status === 'completed') ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Delivery History"
        subtitle={
          completedTrips.length > 0
            ? `${completedTrips.length} completed trip${completedTrips.length !== 1 ? 's' : ''}`
            : undefined
        }
      />

      {isLoading ? (
        /* Skeleton */
        <View style={{ paddingTop: 12 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                marginHorizontal: 16,
                marginVertical: 6,
                borderRadius: 16,
                backgroundColor: '#ffffff',
                padding: 14,
                borderWidth: 1,
                borderColor: '#dde5f0',
              }}
            >
              <View style={{ width: 140, height: 16, borderRadius: 8, backgroundColor: '#f0f4f8', marginBottom: 8 }} />
              <View style={{ width: 90, height: 12, borderRadius: 6, backgroundColor: '#f0f4f8', marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: '#f0f4f8' }} />
                <View style={{ width: 60, height: 12, borderRadius: 6, backgroundColor: '#f0f4f8' }} />
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 16 }}>
            Could not load history
          </Text>
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Pull down to retry
          </Text>
        </View>
      ) : (
        <FlashList
          data={completedTrips}
          renderItem={({ item }) => <HistoryCard trip={item} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="No history yet"
              subtitle="Completed trips will appear here"
            />
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        />
      )}
    </View>
  );
}
