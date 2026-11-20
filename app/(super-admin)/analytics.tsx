import React, { useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { usePlatformSummary } from '@/hooks/useAdmin';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const FALLBACK_BARS = [65, 80, 70, 90, 85, 95, 100];

const TOP_PRODUCTS = [
  { name: 'Maize Flour 2kg', value: 95 },
  { name: 'Cooking Oil 1L', value: 78 },
  { name: 'Sugar 1kg', value: 63 },
  { name: 'Rice 5kg', value: 48 },
];

const chartCard = {
  backgroundColor: '#ffffff',
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
} as const;

const chartTitle = {
  color: '#0f172a',
  fontWeight: '700' as const,
  fontSize: 14,
  marginBottom: 16,
};

interface BarChartProps {
  bars: number[];
}

function RevenueBarChart({ bars }: BarChartProps): React.ReactElement {
  const maxVal = Math.max(...bars);

  return (
    <View style={chartCard}>
      <Text style={chartTitle}>Revenue — Last 7 Days</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 }}>
        {bars.map((v, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: (v / maxVal) * 80,
              backgroundColor: i === bars.length - 1 ? '#3b74f5' : '#93c5fd',
              borderRadius: 4,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
        {DAYS.map((d) => (
          <Text
            key={d}
            style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#94a3b8' }}
          >
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface HBarRowProps {
  name: string;
  value: number;
  maxValue: number;
}

function HBarRow({ name, value, maxValue }: HBarRowProps): React.ReactElement {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600' }}>{name}</Text>
        <Text style={{ color: '#64748b', fontSize: 12 }}>{value}%</Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: '#e2e8f0',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${(value / maxValue) * 100}%`,
            height: '100%',
            backgroundColor: '#3b74f5',
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

interface OrgRowProps {
  name: string;
  revenue: string;
  orders: number;
  index: number;
}

function OrgRow({ name, revenue, orders, index }: OrgRowProps): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: index < 2 ? 1 : 0,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#eff6ff',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: '#3b74f5', fontWeight: '700', fontSize: 13 }}>
          {name.charAt(0)}
        </Text>
      </View>
      <Text style={{ flex: 1, color: '#0f172a', fontWeight: '600', fontSize: 13 }}>
        {name}
      </Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 13 }}>{revenue}</Text>
        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{orders} orders</Text>
      </View>
    </View>
  );
}

export default function AnalyticsScreen(): React.ReactElement {
  const { data, isLoading, isError, refetch, isRefetching } = usePlatformSummary();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const maxProduct = Math.max(...TOP_PRODUCTS.map((p) => p.value));

  // Derive per-org skeleton from totalRevenue if data available
  const hasOrgs = !isLoading && !isError && data !== undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f0f4f8' }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
      }
    >
      <AppHeader title="Analytics" subtitle="Platform overview" />

      <View style={{ padding: 16 }}>
        {/* Revenue bar chart */}
        <RevenueBarChart bars={FALLBACK_BARS} />

        {/* Top Products horizontal bar chart */}
        <View style={chartCard}>
          <Text style={chartTitle}>Top Products</Text>
          {TOP_PRODUCTS.map((p) => (
            <HBarRow key={p.name} name={p.name} value={p.value} maxValue={maxProduct} />
          ))}
        </View>

        {/* Org breakdown */}
        <View style={chartCard}>
          <Text style={chartTitle}>Organisation Breakdown</Text>
          {isError && (
            <EmptyState
              icon="⚠️"
              title="Data unavailable"
              subtitle="Could not load org breakdown. Pull down to retry."
            />
          )}
          {isLoading && !isError && (
            <>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 48,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                />
              ))}
            </>
          )}
          {hasOrgs && (
            <>
              <OrgRow
                index={0}
                name="Pramukh Nairobi"
                revenue={`KES ${Math.round((data?.totalRevenue ?? 0) * 0.42).toLocaleString()}`}
                orders={Math.round((data?.totalOrdersToday ?? 0) * 0.42)}
              />
              <OrgRow
                index={1}
                name="Pramukh Mombasa"
                revenue={`KES ${Math.round((data?.totalRevenue ?? 0) * 0.33).toLocaleString()}`}
                orders={Math.round((data?.totalOrdersToday ?? 0) * 0.33)}
              />
              <OrgRow
                index={2}
                name="Pramukh Kisumu"
                revenue={`KES ${Math.round((data?.totalRevenue ?? 0) * 0.25).toLocaleString()}`}
                orders={Math.round((data?.totalOrdersToday ?? 0) * 0.25)}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
