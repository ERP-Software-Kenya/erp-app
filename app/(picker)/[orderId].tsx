import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderDetail, usePackOrder } from '../../src/hooks/useOrders';
import { PackingItemRow } from '../../src/components/PackingItemRow';
import type { OrderItem } from '../../src/api/orders.api';

function LoadingSkeleton(): React.ReactElement {
  return (
    <View className="flex-1 gap-2 p-4">
      {[0, 1, 2, 3].map((idx) => (
        <View key={idx} className="h-16 rounded-xl bg-surface border border-border animate-pulse" />
      ))}
    </View>
  );
}

export default function PackingScreen(): React.ReactElement {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading } = useOrderDetail(orderId);
  const packOrder = usePackOrder();

  const [packedQtys, setPackedQtys] = useState<Record<string, string>>({});

  const handleQtyChange = useCallback((itemId: string, value: string): void => {
    setPackedQtys((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleMarkAll = useCallback((): void => {
    if (!order?.items) return;
    const filled: Record<string, string> = {};
    for (const item of order.items) {
      filled[item.orderItemId] = String(item.orderedQty);
    }
    setPackedQtys(filled);
  }, [order]);

  const handleComplete = async (): Promise<void> => {
    if (!order?.items) return;

    const items = order.items.map((item) => ({
      orderItemId: item.orderItemId,
      packedQty: parseInt(packedQtys[item.orderItemId] ?? '0', 10),
    }));

    const hasUnpacked = items.some((it) => it.packedQty === 0);
    if (hasUnpacked) {
      Alert.alert(
        'Incomplete packing',
        'Some items have 0 packed quantity. Continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => void submitPacking(items) },
        ],
      );
      return;
    }
    await submitPacking(items);
  };

  const submitPacking = async (
    items: Array<{ orderItemId: string; packedQty: number }>,
  ): Promise<void> => {
    try {
      await packOrder.mutateAsync({ orderId, items });
      Alert.alert('Done', 'Order packed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(picker)') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit packing. Try again.');
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: OrderItem }) => (
      <PackingItemRow
        productName={item.productName}
        binLocation={item.binLocation}
        orderedQty={item.orderedQty}
        packedQty={packedQtys[item.orderItemId] ?? ''}
        onPackedQtyChange={(val) => handleQtyChange(item.orderItemId, val)}
      />
    ),
    [packedQtys, handleQtyChange],
  );

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-border px-4 py-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Text className="text-primary text-base font-semibold">← Back</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text font-bold text-lg">
            #{order?.orderNumber ?? orderId}
          </Text>
          <Text className="text-muted text-sm">{order?.customerName}</Text>
        </View>
      </View>

      {/* Mark All button */}
      <TouchableOpacity
        className="mx-4 mt-3 mb-1 rounded-xl border border-primary py-3 items-center bg-primary/5"
        onPress={handleMarkAll}
        activeOpacity={0.8}
      >
        <Text className="text-primary font-semibold text-sm">
          ✓ Mark All as Received Full
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <FlashList
          data={order?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.orderItemId}
          estimatedItemSize={64}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        />
      )}

      {/* Complete button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <TouchableOpacity
          className={[
            'rounded-xl py-4 items-center',
            packOrder.isPending ? 'bg-primary/50' : 'bg-primary',
          ].join(' ')}
          onPress={handleComplete}
          disabled={packOrder.isPending}
          activeOpacity={0.85}
        >
          {packOrder.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">Complete Packing →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
