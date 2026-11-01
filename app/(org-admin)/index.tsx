import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrgSummary } from '@/hooks/useAdmin';

const TODAY = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function FleetStrip({
  activeDrivers,
  deliveredToday,
  pendingOrders,
  loading,
}: {
  activeDrivers?: number;
  deliveredToday?: number;
  pendingOrders?: number;
  loading: boolean;
}): React.ReactElement {
  const dash = loading ? '--' : undefined;
  return (
    <View
      style={{
        backgroundColor: '#0d1b3e',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        flexDirection: 'row',
      }}
    >
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 24 }}>
          {dash ?? (activeDrivers ?? 0)}
        </Text>
        <Text style={{ color: '#93a5c4', fontSize: 11, marginTop: 4 }}>Active Drivers</Text>
      </View>
      <View style={{ width: 1, backgroundColor: '#1e3a6e' }} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 24 }}>
          {dash ?? (deliveredToday ?? 0)}
        </Text>
        <Text style={{ color: '#93a5c4', fontSize: 11, marginTop: 4 }}>Delivered Today</Text>
      </View>
      <View style={{ width: 1, backgroundColor: '#1e3a6e' }} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 24 }}>
          {dash ?? (pendingOrders ?? 0)}
        </Text>
        <Text style={{ color: '#93a5c4', fontSize: 11, marginTop: 4 }}>Pending Orders</Text>
      </View>
    </View>
  );
}

export default function OrgAdminDashboard(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useOrgSummary();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Dashboard"
        subtitle={`Organization overview · ${TODAY}`}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <FleetStrip
          activeDrivers={data?.activeDrivers}
          deliveredToday={data?.deliveredToday}
          pendingOrders={data?.pendingOrders}
          loading={isLoading}
        />

        {/* KPI Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            gap: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ width: '47%' }}>
            <KpiCard
              value={isLoading ? '--' : `KES ${(data?.revenueToday ?? 0).toLocaleString()}`}
              label="Revenue Today"
              accent="blue"
              trend="↑ vs yesterday"
              trendUp={true}
            />
          </View>
          <View style={{ width: '47%' }}>
            <KpiCard
              value={isLoading ? '--' : String(data?.ordersToday ?? 0)}
              label="Orders Today"
              accent="green"
            />
          </View>
          <View style={{ width: '47%' }}>
            <KpiCard
              value={isLoading ? '--' : String(data?.pendingOrders ?? 0)}
              label="Queue Pending"
              accent="amber"
            />
          </View>
          <View style={{ width: '47%' }}>
            <KpiCard
              value={isLoading ? '--' : String(data?.lowStockCount ?? 0)}
              label="Low Stock Items"
              accent="red"
              trendUp={false}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: 12,
            }}
          >
            Recent Activity
          </Text>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#dde5f0',
              overflow: 'hidden',
            }}
          >
            <EmptyState icon="📋" title="No recent activity" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
