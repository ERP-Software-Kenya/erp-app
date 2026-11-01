import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { useDriverLocations } from '@/hooks/useAdmin';
import type { DriverLocation } from '@/api/admin.api';

const STADIA_TILE_URL =
  'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}.png?api_key=' +
  (process.env.EXPO_PUBLIC_STADIA_MAPS_KEY ?? '');

const NAIROBI_DEFAULT: Region = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

function GpsBadge({ active }: { active: boolean }): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: active ? '#22c55e18' : '#64748b18',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? '#22c55e' : '#64748b',
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: active ? '#22c55e' : '#64748b',
        }}
      >
        {active ? 'Active' : 'Idle'}
      </Text>
    </View>
  );
}

function ActiveDriversBadge({ count }: { count: number }): React.ReactElement {
  return (
    <View
      style={{
        backgroundColor: '#3b74f520',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b74f5' }} />
      <Text style={{ color: '#3b74f5', fontSize: 12, fontWeight: '700' }}>
        {count} on road
      </Text>
    </View>
  );
}

function DriverCard({ driver }: { driver: DriverLocation }): React.ReactElement {
  const stopsText =
    driver.stopsTotal !== undefined
      ? `${driver.stopsDone ?? 0}/${driver.stopsTotal} stops`
      : driver.currentStop ?? 'No active stop';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 160,
        borderWidth: 1,
        borderColor: '#dde5f0',
      }}
    >
      <Text
        style={{ color: '#0f172a', fontWeight: '700', fontSize: 13, marginBottom: 6 }}
        numberOfLines={1}
      >
        {driver.driverName}
      </Text>
      <GpsBadge active={driver.status === 'active'} />
      <Text style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>{stopsText}</Text>
    </View>
  );
}

export default function FleetScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useDriverLocations();

  const drivers = data ?? [];
  const firstDriver = drivers[0];

  const mapRegion: Region = firstDriver
    ? {
        latitude: firstDriver.latitude,
        longitude: firstDriver.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : NAIROBI_DEFAULT;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Live Fleet"
        right={<ActiveDriversBadge count={drivers.length} />}
      />

      <View style={{ flex: 1, position: 'relative' }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#3b74f5" size="large" />
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
              Loading fleet...
            </Text>
          </View>
        ) : (
          <>
            <MapView
              style={{ flex: 1 }}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion}
              mapType={Platform.OS === 'android' ? 'none' : 'standard'}
              showsUserLocation={false}
            >
              {Platform.OS === 'android' && (
                <UrlTile urlTemplate={STADIA_TILE_URL} maximumZ={19} />
              )}
              {drivers.map((driver) => (
                <Marker
                  key={driver.driverId}
                  coordinate={{
                    latitude: driver.latitude,
                    longitude: driver.longitude,
                  }}
                  title={driver.driverName}
                  description={driver.status === 'active' ? 'Active' : 'Idle'}
                  pinColor="#3b74f5"
                />
              ))}
            </MapView>

            {drivers.length === 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(240,244,248,0.85)',
                }}
              >
                <Text style={{ fontSize: 36, marginBottom: 12 }}>🗺️</Text>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16 }}>
                  No drivers on road
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  No active drivers at this time
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Driver cards strip */}
      {drivers.length > 0 && (
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#dde5f0',
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {drivers.map((driver) => (
              <DriverCard key={driver.driverId} driver={driver} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
