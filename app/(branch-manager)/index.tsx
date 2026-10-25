import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useBranchSummary } from '@/hooks/useAdmin';

const ACTIVITY_ITEMS = [
  { id: '1', icon: '📦', description: 'Order #1042 packed and ready', time: '5m ago' },
  { id: '2', icon: '⚠️', description: 'Low stock: Maize Flour 2kg', time: '18m ago' },
  { id: '3', icon: '✅', description: 'Order #1039 fulfilled at store', time: '32m ago' },
  { id: '4', icon: '💰', description: 'Payment recorded for Order #1037', time: '1h ago' },
  { id: '5', icon: '📋', description: 'Order #1035 added to queue', time: '2h ago' },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `KES ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `KES ${(value / 1_000).toFixed(1)}K`;
  return `KES ${value}`;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function BranchDashboardScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: summary, isLoading, isRefetching, refetch } = useBranchSummary();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const revenueValue = isLoading ? '—' : formatCurrency(summary?.revenueToday ?? 0);
  const ordersValue = isLoading ? '—' : String(summary?.ordersToday ?? 0);
  const packedValue = isLoading ? '—' : String(summary?.packedReady ?? 0);
  const lowStockValue = isLoading ? '—' : String(summary?.lowStockCount ?? 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Dashboard"
        subtitle={`Westlands Branch · ${getTodayLabel()}`}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {/* KPI 2x2 Grid */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <KpiCard value={revenueValue} label="Revenue Today" accent="blue" />
          </View>
          <View style={{ flex: 1 }}>
            <KpiCard value={ordersValue} label="Orders Today" accent="green" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <KpiCard value={packedValue} label="Packed & Ready" accent="green" />
          </View>
          <View style={{ flex: 1 }}>
            <KpiCard value={lowStockValue} label="Low Stock" accent="red" />
          </View>
        </View>

        {/* Recent Activity */}
        <Text
          style={{
            color: '#0f172a',
            fontWeight: '700',
            fontSize: 15,
            marginBottom: 12,
            letterSpacing: -0.2,
          }}
        >
          Recent Activity
        </Text>

        {ACTIVITY_ITEMS.length === 0 ? (
          <EmptyState icon="📋" title="No recent activity" subtitle="Activity will appear here" />
        ) : (
          <View style={{ gap: 8 }}>
            {ACTIVITY_ITEMS.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#f0f4f8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '500', lineHeight: 18 }}>
                    {item.description}
                  </Text>
                </View>
                <Text style={{ color: '#64748b', fontSize: 11 }}>{item.time}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
