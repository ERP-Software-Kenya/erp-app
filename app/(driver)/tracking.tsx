import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodayTrips, useTripDetail } from '../../src/hooks/useTrips';
import { AppHeader } from '../../src/components/common/AppHeader';
import type { DeliveryStop } from '../../src/api/trips.api';
import { getActiveTripId } from '../../src/store/active-trip';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// ── GPS status badge ──────────────────────────────────────────────────────────
function GpsBadge({ active }: { active: boolean }): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: active ? '#dcfce7' : '#f1f5f9',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? '#22c55e' : '#94a3b8',
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: active ? '#16a34a' : '#64748b',
        }}
      >
        {active ? 'GPS Live' : 'GPS Off'}
      </Text>
    </View>
  );
}

// ── Stat item ─────────────────────────────────────────────────────────────────
interface StatItemProps {
  value: string;
  label: string;
  accent?: string;
}

function StatItem({ value, label, accent = '#0f172a' }: StatItemProps): React.ReactElement {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
      <Text style={{ color: accent, fontWeight: '800', fontSize: 20 }}>{value}</Text>
      <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function TrackingScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: trips } = useTodayTrips();
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [lastGpsTime, setLastGpsTime] = useState<Date | null>(null);

  const activeTripSummary = trips?.find((t) => t.status === 'in_transit');
  const activeTripId = getActiveTripId() ?? activeTripSummary?.id ?? '';
  const { data: activeTrip } = useTripDetail(activeTripId);
  const nextStop: DeliveryStop | undefined = activeTrip?.stops.find(
    (s) => s.status === 'current',
  );
  const stopsRemaining = activeTrip?.stops.filter((s) => s.status !== 'delivered').length ?? 0;
  const deliveredCount = activeTrip?.stops.filter((s) => s.status === 'delivered').length ?? 0;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (location) => {
          setDriverLocation(location);
          setGpsActive(true);
          setLastGpsTime(new Date());
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const initialRegion: Region = {
    latitude: driverLocation?.coords.latitude ?? (nextStop?.latitude ?? 0),
    longitude: driverLocation?.coords.longitude ?? (nextStop?.longitude ?? 0),
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const showMap = driverLocation !== null || nextStop !== undefined;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Live Tracking" right={<GpsBadge active={gpsActive} />} />

      {/* Map */}
      <View style={{ flex: 1 }}>
        {showMap ? (
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_DEFAULT}
            initialRegion={initialRegion}
            mapType={Platform.OS === 'android' ? 'none' : 'standard'}
            showsUserLocation={false}
          >
            {Platform.OS === 'android' && (
              <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} />
            )}
            {driverLocation && (
              <Marker
                coordinate={{
                  latitude: driverLocation.coords.latitude,
                  longitude: driverLocation.coords.longitude,
                }}
                title="You"
                pinColor="#3b74f5"
              />
            )}
            {nextStop && (
              <Marker
                coordinate={{
                  latitude: nextStop.latitude,
                  longitude: nextStop.longitude,
                }}
                title={nextStop.customerName}
                description={nextStop.address}
                pinColor="#22c55e"
              />
            )}
          </MapView>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#3b74f5" size="large" />
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>
              Acquiring GPS signal…
            </Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#dde5f0',
          flexDirection: 'row',
          paddingVertical: 12,
          paddingHorizontal: 8,
        }}
      >
        <StatItem
          value={String(stopsRemaining)}
          label="Stops left"
          accent="#3b74f5"
        />
        <View style={{ width: 1, backgroundColor: '#dde5f0', marginVertical: 4 }} />
        <StatItem
          value={String(deliveredCount)}
          label="Delivered"
          accent="#22c55e"
        />
        <View style={{ width: 1, backgroundColor: '#dde5f0', marginVertical: 4 }} />
        <StatItem
          value={
            lastGpsTime
              ? lastGpsTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : '--:--'
          }
          label="Last GPS ping"
          accent="#0f172a"
        />
      </View>

      {/* Next stop card */}
      {nextStop && (
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#dde5f0',
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: insets.bottom + 14,
          }}
        >
          <Text
            style={{
              color: '#64748b',
              fontSize: 10,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 6,
            }}
          >
            Next Stop
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#eff6ff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 15 }}>
                {nextStop.customerName}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                {nextStop.address}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
