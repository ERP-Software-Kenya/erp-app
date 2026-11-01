import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { useBranchStockAlerts } from '@/hooks/useAdmin';
import type { StockAlert } from '@/api/admin.api';

type StockStatus = 'out' | 'low' | 'normal';

function getStatus(alert: StockAlert): StockStatus {
  if (alert.isOutOfStock || alert.currentStock === 0) return 'out';
  if (alert.currentStock <= alert.reorderLevel) return 'low';
  return 'normal';
}

const STATUS_COLORS: Record<StockStatus, string> = {
  out: '#ef4444',
  low: '#f59e0b',
  normal: '#22c55e',
};

const STATUS_BG: Record<StockStatus, string> = {
  out: '#fef2f2',
  low: '#fffbeb',
  normal: '#f0fdf4',
};

interface InventoryRowProps {
  item: StockAlert;
}

function InventoryRow({ item }: InventoryRowProps): React.ReactElement {
  const status = getStatus(item);
  const color = STATUS_COLORS[status];
  const bg = STATUS_BG[status];

  // Progress: currentStock / (reorderLevel * 3), clamped 0-1
  const maxBar = Math.max(item.reorderLevel * 3, 1);
  const progress = Math.min(item.currentStock / maxBar, 1);

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      {/* Product icon box */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {status === 'out' ? '🚫' : status === 'low' ? '⚠️' : '✅'}
        </Text>
      </View>

      {/* Name + bin + progress bar */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: '#0f172a', fontWeight: '600', fontSize: 13, marginBottom: 2 }}
          numberOfLines={1}
        >
          {item.productName}
        </Text>
        <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>
          Bin: {item.bin || '—'} · {item.warehouseName}
        </Text>
        {/* Progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: '#f0f4f8',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: 4,
              width: `${progress * 100}%`,
              backgroundColor: color,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Stock count */}
      <Text style={{ color, fontWeight: '700', fontSize: 15, minWidth: 32, textAlign: 'right' }}>
        {item.currentStock}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps): React.ReactElement {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 6,
        backgroundColor: '#f0f4f8',
      }}
    >
      <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>
        {title}
      </Text>
    </View>
  );
}

interface AlertSection {
  title: string;
  data: StockAlert[];
}

export default function BranchInventoryScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { data: alerts, isRefetching, refetch } = useBranchStockAlerts();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return alerts ?? [];
    return (alerts ?? []).filter(
      (a) =>
        a.productName.toLowerCase().includes(q) ||
        a.sku.toLowerCase().includes(q) ||
        a.bin.toLowerCase().includes(q),
    );
  }, [alerts, query]);

  const sections = useMemo<AlertSection[]>(() => {
    const out = filtered.filter((a) => getStatus(a) === 'out');
    const low = filtered.filter((a) => getStatus(a) === 'low');
    const normal = filtered.filter((a) => getStatus(a) === 'normal');
    const result: AlertSection[] = [];
    if (out.length > 0) result.push({ title: 'OUT OF STOCK', data: out });
    if (low.length > 0) result.push({ title: 'LOW STOCK', data: low });
    if (normal.length > 0) result.push({ title: 'NORMAL', data: normal });
    return result;
  }, [filtered]);

  const lowStockCount = useMemo(
    () => (alerts ?? []).filter((a) => getStatus(a) !== 'normal').length,
    [alerts],
  );

  const renderItem = useCallback(
    ({ item }: { item: StockAlert }) => <InventoryRow item={item} />,
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: AlertSection }) => <SectionHeader title={section.title} />,
    [],
  );

  const allNormal = (alerts ?? []).length > 0 && sections.length === 1 && sections[0]?.title === 'NORMAL';

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Inventory"
        subtitle={`${lowStockCount} low stock item${lowStockCount !== 1 ? 's' : ''}`}
      />

      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f0f4f8' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: '#dde5f0',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, SKU, bin..."
            placeholderTextColor="#94a3b8"
            style={{
              flex: 1,
              color: '#0f172a',
              fontSize: 14,
              padding: 0,
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {allNormal ? (
        <View style={{ flex: 1 }}>
          <EmptyState icon="✅" title="All stock levels normal" subtitle="No alerts at this time" />
        </View>
      ) : sections.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState icon="🔍" title="No results" subtitle="Try a different search term" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}
