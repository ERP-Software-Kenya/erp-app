import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodayTrips, useTripDetail } from '../../src/hooks/useTrips';
import type { DeliveryStop } from '../../src/api/trips.api';
import { getActiveTripId } from '../../src/store/active-trip';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

function GpsBadge({ active }: { active: boolean }): React.ReactElement {
  return (
    <View
      className={[
        'flex-row items-center gap-1.5 px-3 py-1.5 rounded-full',
        active ? 'bg-success/10' : 'bg-muted/10',
      ].join(' ')}
    >
      <View className={`w-2 h-2 rounded-full ${active ? 'bg-success' : 'bg-muted'}`} />
      <Text className={`text-xs font-semibold ${active ? 'text-success' : 'text-muted'}`}>
        {active ? 'GPS Live' : 'GPS Off'}
      </Text>
    </View>
  );
}

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

  const showMap =
    driverLocation !== null || (nextStop !== undefined);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-border px-4 py-3 flex-row items-center justify-between">
        <Text className="text-text font-bold text-lg">Live Tracking</Text>
        <GpsBadge active={gpsActive} />
      </View>

      {/* Map */}
      <View className="flex-1">
        {showMap ? (
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_DEFAULT}
            initialRegion={initialRegion}
            mapType={Platform.OS === 'android' ? 'none' : 'standard'}
            showsUserLocation={false}
          >
            {Platform.OS === 'android' && <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} />}
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
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#3b74f5" size="large" />
            <Text className="text-muted text-sm mt-3">Acquiring GPS…</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View className="bg-white border-t border-border px-4 py-3 flex-row gap-4">
        <View className="flex-1 items-center">
          <Text className="text-text font-bold text-xl">{stopsRemaining}</Text>
          <Text className="text-muted text-xs">Stops left</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-text font-bold text-sm">
            {lastGpsTime
              ? lastGpsTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--:--:--'}
          </Text>
          <Text className="text-muted text-xs">Last GPS</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <View className={`w-3 h-3 rounded-full ${gpsActive ? 'bg-success' : 'bg-muted'}`} />
          <Text className="text-muted text-xs mt-1">GPS Status</Text>
        </View>
      </View>

      {/* Next stop card */}
      {nextStop && (
        <View
          className="bg-white border-t border-border px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Text className="text-muted text-xs font-semibold uppercase mb-1">Next Stop</Text>
          <Text className="text-text font-bold text-base">{nextStop.customerName}</Text>
          <Text className="text-muted text-sm mt-0.5 mb-3">{nextStop.address}</Text>
        </View>
      )}
    </View>
  );
}
