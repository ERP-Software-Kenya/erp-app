import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { useSalesOrdersInfinite } from '@/hooks/manager/useSalesOrders';
import { useQuotationsInfinite } from '@/hooks/manager/useQuotations';
import { useSaleReturnsInfinite } from '@/hooks/manager/useSalesReturns';
import type { SaleOrderRow, SaleOrderStatus } from '@/api/manager/sales-orders.api';
import type { QuotationRow, QuotationStatus } from '@/api/manager/quotations.api';
import type { SaleReturnRow, SaleReturnStatus } from '@/api/manager/sales-returns.api';

type SubTab = 'orders' | 'quotations' | 'returns';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const ORDER_STATUS_CONFIG: Record<SaleOrderStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'PENDING', bg: '#fef3c7', color: '#b45309' },
  paid:    { label: 'PAID',    bg: '#d1fae5', color: '#065f46' },
  partial: { label: 'PARTIAL', bg: '#dbeafe', color: '#1d4ed8' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

const QUOTE_STATUS_CONFIG: Record<QuotationStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  sent:      { label: 'SENT',      bg: '#fef3c7', color: '#b45309' },
  converted: { label: 'CONVERTED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

const RETURN_STATUS_CONFIG: Record<SaleReturnStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  finalized: { label: 'FINALIZED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

// ── badge ─────────────────────────────────────────────────────────────────────

function Badge({ label, bg, color }: { label: string; bg: string; color: string }): React.ReactElement {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
      <Text style={{ color, fontSize: 9, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ── order card ────────────────────────────────────────────────────────────────

function OrderCard({ order, onPress }: { order: SaleOrderRow; onPress: () => void }): React.ReactElement {
  const cfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending;
  const amountColor = order.status === 'paid' ? '#22c55e' : order.status === 'partial' ? '#3b74f5' : '#f59e0b';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dde5f0',
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
            {order.customerName}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{order.orderNumber} · {fmtDate(order.createdAt)} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: amountColor, fontWeight: '800', fontSize: 15 }}>{fmt(order.grandTotal)}</Text>
          <Badge {...cfg} />
        </View>
      </View>
      {order.outstanding > 0 && (
        <View style={{ marginTop: 8, backgroundColor: '#fef3c7', borderRadius: 6, padding: 6 }}>
          <Text style={{ color: '#b45309', fontSize: 11, fontWeight: '600' }}>
            Outstanding: {fmt(order.outstanding)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── quotation card ────────────────────────────────────────────────────────────

function QuotationCard({ quote, onPress }: { quote: QuotationRow; onPress: () => void }): React.ReactElement {
  const cfg = QUOTE_STATUS_CONFIG[quote.status] ?? QUOTE_STATUS_CONFIG.draft;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dde5f0',
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderLeftWidth: 3,
        borderLeftColor: '#8b5cf6',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
            {quote.customerName}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{quote.quotationNumber} · {fmtDate(quote.createdAt)} · {quote.itemCount} item{quote.itemCount !== 1 ? 's' : ''}
          </Text>
          {quote.validUntil && (
            <Text style={{ color: '#f59e0b', fontSize: 11, marginTop: 2 }}>
              Valid till {fmtDate(quote.validUntil)}
            </Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: '#8b5cf6', fontWeight: '800', fontSize: 15 }}>{fmt(quote.grandTotal)}</Text>
          <Badge {...cfg} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── return card ───────────────────────────────────────────────────────────────

function ReturnCard({ ret, onPress }: { ret: SaleReturnRow; onPress: () => void }): React.ReactElement {
  const cfg = RETURN_STATUS_CONFIG[ret.status] ?? RETURN_STATUS_CONFIG.draft;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dde5f0',
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
            {ret.customerName}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            #{ret.returnNumber} · Ref: Order #{ret.orderNumber} · {fmtDate(ret.createdAt)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 15 }}>{fmt(ret.totalRefund)}</Text>
          <Badge {...cfg} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── filter chips ──────────────────────────────────────────────────────────────

function FilterChips<T extends string>({
  options,
  value,
  onChange,
  activeColor,
}: {
  options: { label: string; value: T | '' }[];
  value: T | '';
  onChange: (v: T | '') => void;
  activeColor: string;
}): React.ReactElement {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: active ? activeColor : '#ffffff',
              borderWidth: 1,
              borderColor: active ? activeColor : '#dde5f0',
            }}
          >
            <Text style={{ color: active ? '#ffffff' : '#64748b', fontSize: 12, fontWeight: '600' }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── orders tab ────────────────────────────────────────────────────────────────

const ORDER_FILTERS: { label: string; value: SaleOrderStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Partial', value: 'partial' },
];

function OrdersTab({
  onOpenOrder,
  onNewOrder,
}: {
  onOpenOrder: (id: string) => void;
  onNewOrder: () => void;
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleOrderStatus | ''>('');
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useSalesOrdersInfinite({ search: deferredSearch || undefined, status: statusFilter || undefined });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: SaleOrderRow }) => (
      <OrderCard order={item} onPress={() => onOpenOrder(item.id)} />
    ),
    [onOpenOrder],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f4f8' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search orders or customers…"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, fontSize: 14, color: '#0f172a' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ paddingBottom: 10 }}>
        <FilterChips options={ORDER_FILTERS} value={statusFilter} onChange={setStatusFilter} activeColor="#3b74f5" />
      </View>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState icon="🛒" title="No orders found" subtitle="Pull down to refresh or tap + to create one." />
          )
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewOrder}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          right: 16,
          backgroundColor: '#3b74f5',
          borderRadius: 28,
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: '#3b74f5',
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New Order</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── quotations tab ────────────────────────────────────────────────────────────

const QUOTE_FILTERS: { label: string; value: QuotationStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Converted', value: 'converted' },
];

function QuotationsTab({
  onOpenQuotation,
  onNewQuotation,
}: {
  onOpenQuotation: (id: string) => void;
  onNewQuotation: () => void;
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('');
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useQuotationsInfinite({ search: deferredSearch || undefined, status: statusFilter || undefined });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: QuotationRow }) => (
      <QuotationCard quote={item} onPress={() => onOpenQuotation(item.id)} />
    ),
    [onOpenQuotation],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f4f8' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search quotations…"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, fontSize: 14, color: '#0f172a' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ paddingBottom: 10 }}>
        <FilterChips options={QUOTE_FILTERS} value={statusFilter} onChange={setStatusFilter} activeColor="#8b5cf6" />
      </View>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState icon="📋" title="No quotations found" subtitle="Pull down to refresh or tap + to create one." />
          )
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewQuotation}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          right: 16,
          backgroundColor: '#8b5cf6',
          borderRadius: 28,
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: '#8b5cf6',
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New Quotation</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── returns tab ───────────────────────────────────────────────────────────────

const RETURN_FILTERS: { label: string; value: SaleReturnStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Cancelled', value: 'cancelled' },
];

function ReturnsTab({
  onOpenReturn,
  onNewReturn,
}: {
  onOpenReturn: (id: string) => void;
  onNewReturn: () => void;
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleReturnStatus | ''>('');
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useSaleReturnsInfinite({ search: deferredSearch || undefined, status: statusFilter || undefined });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: SaleReturnRow }) => (
      <ReturnCard ret={item} onPress={() => onOpenReturn(item.id)} />
    ),
    [onOpenReturn],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f4f8' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, height: 40 }}>
          <Text style={{ fontSize: 14, marginRight: 8, color: '#64748b' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search returns…"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, fontSize: 14, color: '#0f172a' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ paddingBottom: 10 }}>
        <FilterChips options={RETURN_FILTERS} value={statusFilter} onChange={setStatusFilter} activeColor="#ef4444" />
      </View>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState icon="↩️" title="No returns found" subtitle="Pull down to refresh." />
          )
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
      />
      <TouchableOpacity
        onPress={onNewReturn}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          right: 16,
          backgroundColor: '#ef4444',
          borderRadius: 28,
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: '#ef4444',
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 20, lineHeight: 22 }}>+</Text>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>New Return</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── main screen ───────────────────────────────────────────────────────────────

export interface SalesScreenNavProps {
  onOpenOrder: (id: string) => void;
  onNewOrder: () => void;
  onOpenQuotation: (id: string) => void;
  onNewQuotation: () => void;
  onOpenReturn: (id: string) => void;
  onNewReturn: () => void;
  onNotifications?: () => void;
}

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'returns', label: 'Returns' },
];

const ACTIVE_COLORS: Record<SubTab, string> = {
  orders: '#3b74f5',
  quotations: '#8b5cf6',
  returns: '#ef4444',
};

export function SalesScreen({
  onOpenOrder,
  onNewOrder,
  onOpenQuotation,
  onNewQuotation,
  onOpenReturn,
  onNewReturn,
  onNotifications,
}: SalesScreenNavProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SubTab>('orders');
  const activeColor = ACTIVE_COLORS[activeTab];

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="Sales" onNotifications={onNotifications} />

      {/* Sub-tab pills */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 8 }}>
        {SUB_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const color = ACTIVE_COLORS[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: active ? color : '#f0f4f8',
                borderWidth: 1,
                borderColor: active ? color : '#dde5f0',
              }}
            >
              <Text style={{ color: active ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: 13 }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'orders' && (
        <OrdersTab onOpenOrder={onOpenOrder} onNewOrder={onNewOrder} />
      )}
      {activeTab === 'quotations' && (
        <QuotationsTab onOpenQuotation={onOpenQuotation} onNewQuotation={onNewQuotation} />
      )}
      {activeTab === 'returns' && (
        <ReturnsTab onOpenReturn={onOpenReturn} onNewReturn={onNewReturn} />
      )}
    </View>
  );
}
