import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useOrderQueue, useClaimOrder } from '../../src/hooks/useOrders';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { AppHeader } from '@/components/common/AppHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type { Order } from '../../src/api/orders.api';
import type { OrderStatus } from '@/components/common/StatusBadge';

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function isUrgent(order: Order): boolean {
  if (order.urgency === 'urgent') return true;
  const diffMin = (Date.now() - new Date(order.createdAt).getTime()) / 60_000;
  return diffMin > 30;
}

function toOrderStatus(status: string): OrderStatus {
  const valid: OrderStatus[] = ['queue', 'claimed', 'packed', 'urgent', 'delivered', 'in_transit', 'pending'];
  return valid.includes(status as OrderStatus) ? (status as OrderStatus) : 'pending';
}

// ── skeleton ─────────────────────────────────────────────────────────────────

function LoadingSkeleton(): React.ReactElement {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
      {[0, 1, 2].map((idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: '#f0f4f8',
            borderRadius: 16,
            height: 140,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#dde5f0',
          }}
        />
      ))}
    </View>
  );
}

// ── order card ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onClaim: (orderId: string) => void;
  isClaiming: boolean;
}

function PickerOrderCard({ order, onClaim, isClaiming }: OrderCardProps): React.ReactElement {
  const urgent = isUrgent(order);

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
        flexDirection: 'row',
      }}
    >
      {/* Urgent left-border accent */}
      <View
        style={{
          width: 4,
          backgroundColor: urgent ? '#ef4444' : '#3b74f5',
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />

      <View style={{ flex: 1, padding: 14 }}>
        {/* Row 1: order number + status badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>
            #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
          </Text>
          <StatusBadge status={toOrderStatus(urgent ? 'urgent' : order.status)} />
        </View>

        {/* Row 2: location / customer */}
        {order.customerName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: '#64748b' }}>📍 </Text>
            <Text style={{ fontSize: 13, color: '#64748b' }} numberOfLines={1}>{order.customerName}</Text>
          </View>
        ) : null}

        {/* Row 3: item count + time */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ backgroundColor: '#f0f4f8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0' }}>
              <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>
                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
          {order.binLocations.slice(0, 2).map((bin) => (
            <View key={bin} style={{ backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' }}>
              <Text style={{ fontSize: 11, color: '#1d4ed8', fontWeight: '600' }}>{bin}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
            {timeAgo(order.createdAt)}
          </Text>
        </View>

        {/* Claim button */}
        <TouchableOpacity
          onPress={() => onClaim(order.id)}
          disabled={isClaiming}
          activeOpacity={0.82}
          style={{
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            backgroundColor: isClaiming ? '#93c5fd' : '#3b74f5',
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
            {isClaiming ? 'Claiming…' : 'Claim Order →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

export default function PickerQueueScreen(): React.ReactElement {
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
      <PickerOrderCard
        order={item}
        onClaim={handleClaim}
        isClaiming={claimingIds.has(item.id)}
      />
    ),
    [handleClaim, claimingIds],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <OfflineBanner />
      <AppHeader
        title="Order Queue"
        subtitle={`${orders?.length ?? 0} orders waiting`}
        onNotifications={() => router.push('/(shared)/notifications')}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <FlashList
          data={orders ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              icon="📦"
              title="Queue is empty"
              subtitle="All caught up! Pull down to refresh."
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
