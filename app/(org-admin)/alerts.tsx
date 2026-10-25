import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useStockAlerts } from '@/hooks/useAdmin';
import type { StockAlert } from '@/api/admin.api';

function StockBar({
  current,
  reorderLevel,
  isOutOfStock,
}: {
  current: number;
  reorderLevel: number;
  isOutOfStock: boolean;
}): React.ReactElement {
  const max = Math.max(reorderLevel * 2, 1);
  const ratio = Math.min(current / max, 1);
  const barColor = isOutOfStock ? '#ef4444' : '#f59e0b';

  return (
    <View
      style={{
        height: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(ratio * 100)}%`,
          height: '100%',
          backgroundColor: barColor,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

function AlertCard({
  alert,
  isOutOfStock,
}: {
  alert: StockAlert;
  isOutOfStock: boolean;
}): React.ReactElement {
  const iconBg = isOutOfStock ? '#fef2f2' : '#fffbeb';
  const stockColor = isOutOfStock ? '#ef4444' : '#f59e0b';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: '#dde5f0',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      {/* Icon box */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>📦</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{ color: '#0f172a', fontWeight: '700', fontSize: 13, flex: 1 }}
            numberOfLines={1}
          >
            {alert.productName}
          </Text>
          <Text
            style={{
              color: stockColor,
              fontWeight: '800',
              fontSize: 15,
              marginLeft: 8,
            }}
          >
            {alert.currentStock}
          </Text>
        </View>
        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
          {alert.warehouseName} · {alert.bin}
        </Text>
        <StockBar
          current={alert.currentStock}
          reorderLevel={alert.reorderLevel}
          isOutOfStock={isOutOfStock}
        />
      </View>
    </View>
  );
}

export default function StockAlertsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data, isRefetching, refetch } = useStockAlerts();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const alerts = data ?? [];
  const outOfStock = alerts.filter((a) => a.isOutOfStock);
  const lowStock = alerts.filter((a) => !a.isOutOfStock);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader
        title="Stock Alerts"
        subtitle={`${alerts.length} item${alerts.length !== 1 ? 's' : ''} need attention`}
      />

      {alerts.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
        >
          <EmptyState icon="✅" title="All stock levels normal" />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
        >
          {outOfStock.length > 0 && (
            <>
              <SectionHeader
                title="Out of Stock"
                count={outOfStock.length}
                color="#ef4444"
              />
              {outOfStock.map((alert) => (
                <AlertCard key={alert.id} alert={alert} isOutOfStock={true} />
              ))}
            </>
          )}

          {lowStock.length > 0 && (
            <>
              <SectionHeader
                title="Low Stock"
                count={lowStock.length}
                color="#f59e0b"
              />
              {lowStock.map((alert) => (
                <AlertCard key={alert.id} alert={alert} isOutOfStock={false} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
