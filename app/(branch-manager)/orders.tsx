import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrderQueue } from '@/hooks/useOrders';
import type { Order } from '@/api/orders.api';

type Segment = 'queue' | 'packed';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface OrderRowCardProps {
  order: Order;
  segment: Segment;
}

function OrderRowCard({ order, segment }: OrderRowCardProps): React.ReactElement {
  const isUrgent = order.urgency === 'urgent';
  const location = order.binLocations.length > 0 ? order.binLocations[0] : 'No location';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderLeftWidth: isUrgent ? 3 : 0,
        borderLeftColor: '#ef4444',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14, flex: 1 }}>
          {order.orderNumber}
        </Text>
        {segment === 'packed' ? (
          <View
            style={{
              backgroundColor: '#d1fae5',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#065f46', fontSize: 10, fontWeight: '700' }}>PACKED</Text>
          </View>
        ) : (
          <StatusBadge status={isUrgent ? 'urgent' : (order.status as 'queue' | 'claimed' | 'packed' | 'delivered' | 'in_transit' | 'pending') ?? 'queue'} />
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: segment === 'queue' ? 10 : 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12 }}>📍</Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>{location}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12 }}>📦</Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>{order.itemCount} items</Text>
        </View>
        <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 'auto' }}>
          {timeAgo(order.createdAt)}
        </Text>
      </View>

      {segment === 'packed' && (
        <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
          Ready for dispatch
        </Text>
      )}

      {segment === 'queue' && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={{
              flex: 1,
              backgroundColor: '#eff6ff',
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Text style={{ color: '#3b74f5', fontSize: 12, fontWeight: '700' }}>Fulfill Store</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            style={{
              flex: 1,
              backgroundColor: '#f0fdf4',
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#bbf7d0',
            }}
          >
            <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>Record Pay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BranchOrdersScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<Segment>('queue');
  const { data: orders, isRefetching, refetch } = useOrderQueue();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const queueOrders = (orders ?? []).filter((o) => o.status !== 'packed');
  const packedOrders = (orders ?? []).filter((o) => o.status === 'packed');
  const displayedOrders = segment === 'queue' ? queueOrders : packedOrders;

  const renderItem = useCallback(
    ({ item }: { item: Order }) => <OrderRowCard order={item} segment={segment} />,
    [segment],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Orders" />

      {/* Segmented Control */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f0f4f8' }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#dde5f0',
            borderRadius: 12,
            padding: 4,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSegment('queue')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: segment === 'queue' ? '#ffffff' : 'transparent',
              shadowColor: segment === 'queue' ? '#000' : 'transparent',
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: segment === 'queue' ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: segment === 'queue' ? '#0f172a' : '#64748b',
              }}
            >
              Queue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSegment('packed')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: segment === 'packed' ? '#ffffff' : 'transparent',
              shadowColor: segment === 'packed' ? '#000' : 'transparent',
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: segment === 'packed' ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: segment === 'packed' ? '#0f172a' : '#64748b',
              }}
            >
              Packed & Ready
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        data={displayedOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            icon={segment === 'queue' ? '📭' : '📦'}
            title={segment === 'queue' ? 'No orders in queue' : 'No packed orders'}
            subtitle={segment === 'queue' ? 'All caught up!' : 'Packed orders will appear here'}
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 4, paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}
