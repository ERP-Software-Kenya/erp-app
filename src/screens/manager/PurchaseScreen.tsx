import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { usePurchaseOrdersInfinite } from '@/hooks/manager/usePurchaseOrders';
import { usePurchaseReturnsInfinite } from '@/hooks/manager/usePurchaseReturns';
import type { PurchaseOrderRow, PurchaseOrderStatus } from '@/api/manager/purchase-orders.api';
import type { PurchaseReturnRow, PurchaseReturnStatus } from '@/api/manager/purchase-returns.api';

type SubTab = 'orders' | 'returns';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const PO_STATUS: Record<PurchaseOrderStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  ordered:   { label: 'ORDERED',   bg: '#dbeafe', color: '#1d4ed8' },
  partial:   { label: 'PARTIAL',   bg: '#fef3c7', color: '#b45309' },
  received:  { label: 'RECEIVED',  bg: '#d1fae5', color: '#065f46' },
  paid:      { label: 'PAID',      bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

const PR_STATUS: Record<PurchaseReturnStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  finalized: { label: 'FINALIZED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }): React.ReactElement {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
      <Text style={{ color, fontSize: 9, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (t: string) => void; placeholder: string }): React.ReactElement {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
        <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
        <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#94a3b8" style={{ flex: 1, fontSize: 14, color: '#0f172a' }} />
        {value.length > 0 && <TouchableOpacity onPress={() => onChange('')}><Text style={{ color: '#94a3b8' }}>✕</Text></TouchableOpacity>}
      </View>
    </View>
  );
}

const PO_FILTERS: { label: string; value: PurchaseOrderStatus | '' }[] = [
  { label: 'All', value: '' }, { label: 'Draft', value: 'draft' },
  { label: 'Ordered', value: 'ordered' }, { label: 'Received', value: 'received' }, { label: 'Paid', value: 'paid' },
];

function POCard({ po, onPress }: { po: PurchaseOrderRow; onPress: () => void }): React.ReactElement {
  const cfg = PO_STATUS[po.status] ?? PO_STATUS.draft;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#dde5f0', padding: 14, borderLeftWidth: 3, borderLeftColor: '#09b6e8' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{po.supplierName}</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{po.poNumber} · {fmtDate(po.createdAt)} · {po.itemCount} item{po.itemCount !== 1 ? 's' : ''}
          </Text>
          {po.expectedDelivery && (
            <Text style={{ color: '#f59e0b', fontSize: 11, marginTop: 2 }}>Expected: {fmtDate(po.expectedDelivery)}</Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: '#09b6e8', fontWeight: '800', fontSize: 15 }}>{fmt(po.grandTotal)}</Text>
          <Badge {...cfg} />
        </View>
      </View>
      {po.outstanding > 0 && (
        <View style={{ marginTop: 8, backgroundColor: '#fef3c7', borderRadius: 6, padding: 6 }}>
          <Text style={{ color: '#b45309', fontSize: 11, fontWeight: '600' }}>Outstanding: {fmt(po.outstanding)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function PRCard({ ret, onPress }: { ret: PurchaseReturnRow; onPress: () => void }): React.ReactElement {
  const cfg = PR_STATUS[ret.status] ?? PR_STATUS.draft;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#dde5f0', padding: 14, borderLeftWidth: 3, borderLeftColor: '#f59e0b' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{ret.supplierName}</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{ret.returnNumber} · Ref: PO #{ret.poNumber} · {fmtDate(ret.createdAt)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 15 }}>{fmt(ret.totalRefund)}</Text>
          <Badge {...cfg} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function POTab({ onOpenPO, onNewPO }: { onOpenPO: (id: string) => void; onNewPO: () => void }): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PurchaseOrderStatus | ''>('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    usePurchaseOrdersInfinite({ search: deferredSearch || undefined, status: status || undefined });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search POs or suppliers…" />
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }} contentContainerStyle={{ gap: 8 }}>
          {PO_FILTERS.map((f) => (
            <TouchableOpacity key={f.value} onPress={() => setStatus(f.value)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: status === f.value ? '#09b6e8' : '#ffffff', borderWidth: 1, borderColor: status === f.value ? '#09b6e8' : '#dde5f0' }}>
              <Text style={{ color: status === f.value ? '#ffffff' : '#64748b', fontSize: 12, fontWeight: '600' }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlashList
        data={rows}
        renderItem={({ item }) => <POCard po={item} onPress={() => onOpenPO(item.id)} />}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={isLoading ? null : <EmptyState icon="🛍️" title="No purchase orders" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewPO}
        style={{ position: 'absolute', bottom: insets.bottom + 16, right: 16, backgroundColor: '#09b6e8', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#09b6e8', shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New PO</Text>
      </TouchableOpacity>
    </View>
  );
}

function PRTab({ onOpenReturn, onNewReturn }: { onOpenReturn: (id: string) => void; onNewReturn: () => void }): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    usePurchaseReturnsInfinite({ search: deferredSearch || undefined });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search purchase returns…" />
      <FlashList
        data={rows}
        renderItem={({ item }) => <PRCard ret={item} onPress={() => onOpenReturn(item.id)} />}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={isLoading ? null : <EmptyState icon="↩️" title="No purchase returns" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewReturn}
        style={{ position: 'absolute', bottom: insets.bottom + 16, right: 16, backgroundColor: '#f59e0b', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 6 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New Return</Text>
      </TouchableOpacity>
    </View>
  );
}

export interface PurchaseScreenNavProps {
  onOpenPO: (id: string) => void;
  onNewPO: () => void;
  onOpenPurchaseReturn: (id: string) => void;
  onNewPurchaseReturn: () => void;
  onNotifications?: () => void;
}

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'returns', label: 'Returns' },
];

const ACTIVE_COLORS: Record<SubTab, string> = {
  orders: '#09b6e8',
  returns: '#f59e0b',
};

export function PurchaseScreen({ onOpenPO, onNewPO, onOpenPurchaseReturn, onNewPurchaseReturn, onNotifications }: PurchaseScreenNavProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SubTab>('orders');
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Purchase" onNotifications={onNotifications} />
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 8 }}>
        {SUB_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const color = ACTIVE_COLORS[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? color : '#f0f4f8', borderWidth: 1, borderColor: active ? color : '#dde5f0' }}
            >
              <Text style={{ color: active ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: 13 }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeTab === 'orders' && <POTab onOpenPO={onOpenPO} onNewPO={onNewPO} />}
      {activeTab === 'returns' && <PRTab onOpenReturn={onOpenPurchaseReturn} onNewReturn={onNewPurchaseReturn} />}
    </View>
  );
}
