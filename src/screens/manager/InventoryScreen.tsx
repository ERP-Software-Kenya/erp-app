import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { KpiCard } from '@/components/common/KpiCard';
import { useInventoryInfinite, useInventoryValuation, useStockTransfers } from '@/hooks/manager/useInventory';
import type { InventoryItem, StockTransfer, StockStatus } from '@/api/manager/inventory.api';

type SubTab = 'stock' | 'transfers';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const STOCK_STATUS: Record<StockStatus, { label: string; bg: string; color: string }> = {
  in_stock:     { label: 'IN STOCK',  bg: '#d1fae5', color: '#065f46' },
  low_stock:    { label: 'LOW STOCK', bg: '#fef3c7', color: '#b45309' },
  out_of_stock: { label: 'OUT',       bg: '#fee2e2', color: '#991b1b' },
};

const TRANSFER_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'PENDING',   bg: '#dbeafe', color: '#1d4ed8' },
  completed: { label: 'COMPLETED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

function StockCard({ item, onPress }: { item: InventoryItem; onPress: () => void }): React.ReactElement {
  const cfg = STOCK_STATUS[item.status] ?? STOCK_STATUS.in_stock;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#dde5f0', padding: 14 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.productName}</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            SKU: {item.sku} · {item.locationName}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>{item.onHandQty}</Text>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 9, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <Text style={{ color: '#64748b', fontSize: 11 }}>Available: <Text style={{ color: '#22c55e', fontWeight: '700' }}>{item.availableQty}</Text></Text>
        <Text style={{ color: '#64748b', fontSize: 11 }}>Reserved: <Text style={{ color: '#f59e0b', fontWeight: '700' }}>{item.reservedQty}</Text></Text>
        <Text style={{ color: '#64748b', fontSize: 11 }}>Value: <Text style={{ fontWeight: '700' }}>{fmt(item.stockValue)}</Text></Text>
      </View>
    </TouchableOpacity>
  );
}

function TransferCard({ transfer, onPress }: { transfer: StockTransfer; onPress: () => void }): React.ReactElement {
  const cfg = TRANSFER_STATUS[transfer.status] ?? TRANSFER_STATUS.pending;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#dde5f0', padding: 14 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 13 }}>
            {transfer.fromLocationName} → {transfer.toLocationName}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{transfer.transferNumber} · {fmtDate(transfer.createdAt)} · {transfer.itemCount} item{transfer.itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
          <Text style={{ color: cfg.color, fontSize: 9, fontWeight: '700' }}>{cfg.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const STOCK_FILTERS: { label: string; value: StockStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
];

function StockTab({ onOpenItem, onNotifications }: { onOpenItem: (id: string) => void; onNotifications?: () => void }): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | ''>('');
  const deferredSearch = useDeferredValue(search);
  const { data: valuation } = useInventoryValuation();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useInventoryInfinite({ search: deferredSearch || undefined, status: statusFilter || undefined });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1 }}>
      {/* Valuation strip */}
      {valuation && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
          <View style={{ flex: 1 }}>
            <KpiCard value={fmt(valuation.totalValue)} label="Stock Value" accent="blue" />
          </View>
          <View style={{ flex: 1 }}>
            <KpiCard value={String(valuation.lowStockCount)} label="Low Stock" accent="amber" />
          </View>
        </View>
      )}
      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search product or SKU…" placeholderTextColor="#94a3b8" style={{ flex: 1, fontSize: 14, color: '#0f172a' }} />
          <TouchableOpacity><Text style={{ fontSize: 18 }}>📷</Text></TouchableOpacity>
        </View>
      </View>
      {/* Filters */}
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }} contentContainerStyle={{ gap: 8 }}>
          {STOCK_FILTERS.map((f) => (
            <TouchableOpacity key={f.value} onPress={() => setStatusFilter(f.value)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: statusFilter === f.value ? '#3b74f5' : '#ffffff', borderWidth: 1, borderColor: statusFilter === f.value ? '#3b74f5' : '#dde5f0' }}>
              <Text style={{ color: statusFilter === f.value ? '#ffffff' : '#64748b', fontSize: 12, fontWeight: '600' }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlashList
        data={rows}
        renderItem={({ item }) => <StockCard item={item} onPress={() => onOpenItem(item.id)} />}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={isLoading ? null : <EmptyState icon="📦" title="No inventory items found" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}

const TRANSFER_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

function TransfersTab({ onOpenTransfer, onNewTransfer }: { onOpenTransfer: (id: string) => void; onNewTransfer: () => void }): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useStockTransfers({ search: deferredSearch || undefined, status: status || undefined });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search transfers…" placeholderTextColor="#94a3b8" style={{ flex: 1, fontSize: 14, color: '#0f172a' }} />
        </View>
      </View>
      <View style={{ paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }} contentContainerStyle={{ gap: 8 }}>
          {TRANSFER_FILTERS.map((f) => (
            <TouchableOpacity key={f.value} onPress={() => setStatus(f.value)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: status === f.value ? '#3b74f5' : '#ffffff', borderWidth: 1, borderColor: status === f.value ? '#3b74f5' : '#dde5f0' }}>
              <Text style={{ color: status === f.value ? '#ffffff' : '#64748b', fontSize: 12, fontWeight: '600' }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlashList
        data={rows}
        renderItem={({ item }) => <TransferCard transfer={item} onPress={() => onOpenTransfer(item.id)} />}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={isLoading ? null : <EmptyState icon="🔄" title="No stock transfers" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewTransfer}
        style={{ position: 'absolute', bottom: insets.bottom + 16, right: 16, backgroundColor: '#3b74f5', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 6 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New Transfer</Text>
      </TouchableOpacity>
    </View>
  );
}

export interface InventoryScreenNavProps {
  onOpenInventoryItem: (id: string) => void;
  onOpenTransfer: (id: string) => void;
  onNewTransfer: () => void;
  onNotifications?: () => void;
}

export function InventoryScreen({ onOpenInventoryItem, onOpenTransfer, onNewTransfer, onNotifications }: InventoryScreenNavProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SubTab>('stock');
  const SUB_TABS: { key: SubTab; label: string }[] = [{ key: 'stock', label: 'Stock' }, { key: 'transfers', label: 'Transfers' }];
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Inventory" onNotifications={onNotifications} />
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 8 }}>
        {SUB_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? '#3b74f5' : '#f0f4f8', borderWidth: 1, borderColor: active ? '#3b74f5' : '#dde5f0' }}
            >
              <Text style={{ color: active ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: 13 }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeTab === 'stock' && <StockTab onOpenItem={onOpenInventoryItem} onNotifications={onNotifications} />}
      {activeTab === 'transfers' && <TransfersTab onOpenTransfer={onOpenTransfer} onNewTransfer={onNewTransfer} />}
    </View>
  );
}
