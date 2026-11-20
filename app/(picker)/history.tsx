import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── types ─────────────────────────────────────────────────────────────────────

interface HistoryOrder {
  id: string;
  orderNumber: string;
  completedAt: string;
  itemCount: number;
  customerName?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── history card ──────────────────────────────────────────────────────────────

function HistoryCard({ item }: { item: HistoryOrder }): React.ReactElement {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Left icon */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: '#d1fae5',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>✅</Text>
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>
          #{item.orderNumber}
        </Text>
        {item.customerName ? (
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }} numberOfLines={1}>
            {item.customerName}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>{formatDate(item.completedAt)}</Text>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#cbd5e1' }} />
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>{item.itemCount} items</Text>
        </View>
      </View>

      {/* Status badge */}
      <StatusBadge status="packed" />
    </View>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

// Placeholder: wire up real data when the history API endpoint is available.
const MOCK_HISTORY: HistoryOrder[] = [];

export default function PickerHistoryScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="History"
        subtitle="Your completed orders"
        onNotifications={() => router.push('/(shared)/notifications')}
      />

      {MOCK_HISTORY.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No completed orders yet"
          subtitle="Orders you pack will appear here."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {MOCK_HISTORY.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
