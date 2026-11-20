import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';

// ── types ─────────────────────────────────────────────────────────────────────

interface PackingItem {
  orderItemId: string;
  productName: string;
  binLocation: string;
  orderedQty: number;
  packed: boolean;
}

// ── progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ packed, total }: { packed: number; total: number }): React.ReactElement {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>
          Progress
        </Text>
        <Text style={{ color: pct === 100 ? '#22c55e' : '#3b74f5', fontSize: 13, fontWeight: '700' }}>
          {packed}/{total} packed ({pct}%)
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <View
          style={{
            height: 8,
            width: `${pct}%`,
            backgroundColor: pct === 100 ? '#22c55e' : '#3b74f5',
            borderRadius: 8,
          }}
        />
      </View>
    </View>
  );
}

// ── packing item card ─────────────────────────────────────────────────────────

interface PackingItemCardProps {
  item: PackingItem;
  onToggle: (id: string) => void;
}

function PackingItemCard({ item, onToggle }: PackingItemCardProps): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={() => onToggle(item.orderItemId)}
      activeOpacity={0.75}
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: item.packed ? '#22c55e' : '#dde5f0',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Checkbox */}
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: item.packed ? '#22c55e' : '#cbd5e1',
          backgroundColor: item.packed ? '#22c55e' : '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {item.packed && <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>✓</Text>}
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: item.packed ? '#94a3b8' : '#0f172a',
            fontWeight: '600',
            fontSize: 14,
            textDecorationLine: item.packed ? 'line-through' : 'none',
          }}
          numberOfLines={2}
        >
          {item.productName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
          {/* Bin location tag */}
          <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' }}>
            <Text style={{ fontSize: 11, color: '#1d4ed8', fontWeight: '700' }}>
              {item.binLocation || 'No bin'}
            </Text>
          </View>
        </View>
      </View>

      {/* Qty bubble */}
      <View
        style={{
          minWidth: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: item.packed ? '#f0fdf4' : '#f0f4f8',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          marginLeft: 8,
        }}
      >
        <Text style={{ color: item.packed ? '#22c55e' : '#64748b', fontWeight: '800', fontSize: 14 }}>
          {item.orderedQty}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

// Active screen is reached after claiming via /(picker)/[orderId].
// This tab shows a holding state when no order is active.
// When you claim an order from the queue, you navigate to /(picker)/[orderId] for packing;
// this tab is an alternate entry / overview.

export default function PickerActiveScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // Demo state — in production wire up an "active order" store/hook
  // that persists the claimed orderId and fetches via useOrderDetail.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated items — replace with real data from useOrderDetail(activeOrderId)
  const [items, setItems] = useState<PackingItem[]>([]);

  const packedCount = useMemo(() => items.filter((i) => i.packed).length, [items]);
  const allPacked = items.length > 0 && packedCount === items.length;

  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.orderItemId === id ? { ...item, packed: !item.packed } : item,
      ),
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!allPacked) {
      Alert.alert('Incomplete', 'Please check off all items before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      // packOrder.mutateAsync({ orderId, items: payload }) would go here
      await new Promise<void>((resolve) => setTimeout(resolve, 800)); // demo delay
      Alert.alert('Submitted', 'Order packed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(picker)/') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [allPacked]);

  const hasItems = items.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Active Order"
        subtitle={hasItems ? 'Pack items and submit' : 'No active order'}
        onNotifications={() => router.push('/(shared)/notifications')}
      />

      {!hasItems ? (
        <EmptyState
          icon="⚡"
          title="No active order"
          subtitle="Claim an order from the queue to start packing."
        />
      ) : (
        <>
          {/* Order info card */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 14,
              backgroundColor: '#0d1b3e',
              padding: 16,
            }}
          >
            <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Active Order
            </Text>
            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', marginTop: 4 }}>
              #ORDER-001
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
              Warehouse A · 3 items to pack
            </Text>
          </View>

          {/* Progress */}
          <View style={{ marginTop: 8 }}>
            <ProgressBar packed={packedCount} total={items.length} />
          </View>

          {/* Items list */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <PackingItemCard key={item.orderItemId} item={item} onToggle={handleToggle} />
            ))}
          </ScrollView>

          {/* Submit button */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#dde5f0',
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 12,
            }}
          >
            <TouchableOpacity
              onPress={() => void handleSubmit()}
              disabled={!allPacked || isSubmitting}
              activeOpacity={0.85}
              style={{
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                backgroundColor: allPacked && !isSubmitting ? '#3b74f5' : '#cbd5e1',
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: allPacked ? '#ffffff' : '#94a3b8', fontWeight: '700', fontSize: 16 }}>
                  {allPacked ? 'Submit Pack ✓' : `Pack ${items.length - packedCount} more item${items.length - packedCount !== 1 ? 's' : ''}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
