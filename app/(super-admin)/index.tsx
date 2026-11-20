import React, { useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { EmptyState } from '@/components/common/EmptyState';
import { usePlatformSummary } from '@/hooks/useAdmin';
import { useRouter } from 'expo-router';

const TODAY = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface StatRowProps {
  label: string;
  value: string;
  dotColor: string;
}

function StatRow({ label, value, dotColor }: StatRowProps): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginRight: 10,
        }}
      />
      <Text style={{ flex: 1, color: '#0f172a', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>{value}</Text>
    </View>
  );
}

export default function PlatformDashboard(): React.ReactElement {
  const { data, isLoading, isError, refetch, isRefetching } = usePlatformSummary();
  const router = useRouter();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const fmt = (n: number | undefined, prefix = ''): string =>
    n !== undefined ? `${prefix}${n.toLocaleString()}` : '—';

  const fmtPct = (n: number | undefined): string =>
    n !== undefined ? `${n.toFixed(1)}%` : '—';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f0f4f8' }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
      }
    >
      <AppHeader
        title="Platform"
        subtitle={`All Organizations · ${TODAY}`}
        onNotifications={() => router.push('/(shared)/notifications')}
      />

      {/* Fleet strip */}
      <View
        style={{
          backgroundColor: '#0d1b3e',
          paddingVertical: 16,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 0,
        }}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 20 }}>
            {isLoading ? '…' : fmt(data?.totalOrgs)}
          </Text>
          <Text style={{ color: '#93c5fd', fontSize: 11, marginTop: 3 }}>Total Orgs</Text>
        </View>
        <View
          style={{ width: 1, backgroundColor: '#1e3a5f', marginVertical: 4 }}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 20 }}>
            {isLoading ? '…' : fmt(data?.totalActiveDrivers)}
          </Text>
          <Text style={{ color: '#93c5fd', fontSize: 11, marginTop: 3 }}>Drivers Today</Text>
        </View>
        <View
          style={{ width: 1, backgroundColor: '#1e3a5f', marginVertical: 4 }}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 20 }}>
            {isLoading ? '…' : fmtPct(data?.deliveryRate)}
          </Text>
          <Text style={{ color: '#93c5fd', fontSize: 11, marginTop: 3 }}>Delivery Rate</Text>
        </View>
      </View>

      {/* KPI grid */}
      <View style={{ padding: 16, gap: 12 }}>
        {isError ? (
          <EmptyState
            icon="⚠️"
            title="Data unavailable"
            subtitle="Could not load platform summary. Pull down to retry."
          />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <KpiCard
                  value={isLoading ? '…' : `KES ${fmt(data?.totalRevenue)}`}
                  label="Platform Revenue"
                  accent="blue"
                  trend="↑ this week"
                  trendUp
                />
              </View>
              <View style={{ flex: 1 }}>
                <KpiCard
                  value={isLoading ? '…' : fmtPct(data?.deliveryRate)}
                  label="Delivery Rate"
                  accent="green"
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <KpiCard
                  value={isLoading ? '…' : fmt(data?.totalActiveUsers)}
                  label="Active Users"
                  accent="amber"
                  trend="Across all orgs"
                />
              </View>
              <View style={{ flex: 1 }}>
                <KpiCard
                  value={isLoading ? '…' : fmt(data?.totalStockAlerts)}
                  label="Stock Alerts"
                  accent="red"
                  trendUp={false}
                  trend="Across orgs"
                />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Platform Health */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 24,
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{ color: '#0f172a', fontWeight: '700', fontSize: 15, marginBottom: 8 }}
        >
          Platform Health
        </Text>

        <StatRow
          label="Orders Today"
          value={isLoading ? '…' : fmt(data?.totalOrdersToday)}
          dotColor="#3b74f5"
        />
        <StatRow
          label="Active Drivers"
          value={isLoading ? '…' : fmt(data?.totalActiveDrivers)}
          dotColor="#22c55e"
        />
        <StatRow
          label="Orgs Active"
          value={isLoading ? '…' : fmt(data?.totalOrgs)}
          dotColor="#f59e0b"
        />
        <StatRow
          label="Active Users"
          value={isLoading ? '…' : fmt(data?.totalActiveUsers)}
          dotColor="#3b74f5"
        />
        <StatRow
          label="Stock Alerts"
          value={isLoading ? '…' : fmt(data?.totalStockAlerts)}
          dotColor="#ef4444"
        />
        <StatRow
          label="Delivery Rate"
          value={isLoading ? '…' : fmtPct(data?.deliveryRate)}
          dotColor="#22c55e"
        />
      </View>
    </ScrollView>
  );
}
