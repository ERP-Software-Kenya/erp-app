import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useOrderQueue } from '@/hooks/useOrders';
import type { Order } from '@/api/orders.api';
import type { OrderStatus } from '@/components/common/StatusBadge';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isUrgentOrOld(order: Order): boolean {
  if (order.urgency === 'urgent') return true;
  const ageMin = (Date.now() - new Date(order.createdAt).getTime()) / 60_000;
  return ageMin > 120;
}

const VALID_STATUSES: OrderStatus[] = ['queue', 'claimed', 'packed', 'urgent', 'delivered', 'in_transit', 'pending'];

function isValidStatus(status: string): status is OrderStatus {
  return (VALID_STATUSES as string[]).includes(status);
}

function OrderQueueCard({ order }: { order: Order }): React.ReactElement {
  const urgent = isUrgentOrOld(order);
  const displayStatus = isValidStatus(order.status) ? order.status : 'pending';
  const isPending = order.status === 'queue' || order.status === 'pending';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dde5f0',
        overflow: 'hidden',
        borderLeftWidth: urgent ? 3 : 1,
        borderLeftColor: urgent ? '#ef4444' : '#dde5f0',
      }}
    >
      <View style={{ padding: 14 }}>
        {/* Row 1: order number + status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 15 }}>
            {order.orderNumber}
          </Text>
          <StatusBadge status={displayStatus} />
        </View>

        {/* Row 2: location, item count, time ago */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#64748b', fontSize: 12, flex: 1 }} numberOfLines={1}>
            {order.customerName || 'Unknown location'}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>
            {timeAgo(order.createdAt)}
          </Text>
        </View>

        {/* Action row */}
        {isPending && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#3b74f5',
                borderRadius: 8,
                paddingVertical: 7,
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                Fulfill Store
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#22c55e',
                borderRadius: 8,
                paddingVertical: 7,
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                Record Pay
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function OrderQueueScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: orders, isRefetching, refetch } = useOrderQueue();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <OrderQueueCard order={item} />
  ), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Order Queue" />
      <FlashList
        data={orders ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState icon="📦" title="No orders in queue" />
        }
        ListHeaderComponent={<View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
