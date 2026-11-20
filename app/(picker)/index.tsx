import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderQueue, useClaimOrder } from '../../src/hooks/useOrders';
import { OrderCard } from '../../src/components/OrderCard';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import type { Order } from '../../src/api/orders.api';

function EmptyQueue(): React.ReactElement {
  return (
    <View className="flex-1 items-center justify-center py-24">
      <Text className="text-4xl mb-4">📦</Text>
      <Text className="text-text font-semibold text-lg">Queue is empty</Text>
      <Text className="text-muted text-sm mt-1">Pull down to refresh</Text>
    </View>
  );
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <View className="flex-1">
      {[0, 1, 2].map((idx) => (
        <View
          key={idx}
          className="mx-4 my-2 rounded-2xl bg-surface border border-border h-36 animate-pulse"
        />
      ))}
    </View>
  );
}

export default function PickerQueueScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: orders, isLoading, refetch, isRefetching } = useOrderQueue();
  const claimOrder = useClaimOrder();
  const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set());

  const handleClaim = useCallback(
    async (orderId: string): Promise<void> => {
      setClaimingIds((prev) => new Set(prev).add(orderId));
      try {
        await claimOrder.mutateAsync(orderId);
        router.push(`/(picker)/${orderId}`);
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 409) {
          Alert.alert('Already claimed', 'Another picker claimed this order.');
        } else {
          Alert.alert('Error', 'Could not claim order. Try again.');
        }
      } finally {
        setClaimingIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [claimOrder],
  );

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        order={item}
        onClaim={handleClaim}
        isClaiming={claimingIds.has(item.id)}
      />
    ),
    [handleClaim, claimingIds],
  );

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <OfflineBanner />
      <View className="px-4 py-4 bg-white border-b border-border">
        <Text className="text-2xl font-bold text-text">Order Queue</Text>
        <Text className="text-muted text-sm mt-0.5">
          {orders?.length ?? 0} orders waiting
        </Text>
      </View>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <FlashList
          data={orders ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyQueue />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      )}
    </View>
  );
}
