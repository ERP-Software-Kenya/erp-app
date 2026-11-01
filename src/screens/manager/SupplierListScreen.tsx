import React, { useState, useCallback, useDeferredValue } from 'react';
import { View, Text, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/common/EmptyState';
import { useSuppliersInfinite } from '@/hooks/manager/useSuppliers';
import type { Supplier } from '@/api/manager/suppliers.api';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }

function SupplierCard({ supplier, onPress }: { supplier: Supplier; onPress: () => void }): React.ReactElement {
  const hasPayable = supplier.outstandingPayable > 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#dde5f0', padding: 14 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 15 }}>{supplier.name}</Text>
          {supplier.phone && <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{supplier.phone}</Text>}
          {supplier.address && <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }} numberOfLines={1}>{supplier.address}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: hasPayable ? '#f59e0b' : '#22c55e', fontWeight: '700', fontSize: 13 }}>
            {fmt(supplier.outstandingPayable)}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 10 }}>payable</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export interface SupplierListScreenProps {
  onOpenSupplier: (id: string) => void;
  onBack: () => void;
}

export function SupplierListScreen({ onOpenSupplier, onBack }: SupplierListScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useSuppliersInfinite({ search: deferredSearch || undefined });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Supplier }) => (
      <SupplierCard supplier={item} onPress={() => onOpenSupplier(item.id)} />
    ),
    [onOpenSupplier],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3b74f5', fontSize: 14 }}>← More</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 22 }}>Suppliers</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search name or phone…" placeholderTextColor="#94a3b8" style={{ flex: 1, fontSize: 14, color: '#0f172a' }} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: '#94a3b8' }}>✕</Text></TouchableOpacity>}
        </View>
      </View>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={isLoading ? null : <EmptyState icon="🏭" title="No suppliers found" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}
