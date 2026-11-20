import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePurchaseReturn, useFinalizePurchaseReturn, useCancelPurchaseReturn } from '@/hooks/manager/usePurchaseReturns';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  finalized: { label: 'FINALIZED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
} as const;

export interface PurchaseReturnDetailScreenProps {
  id: string;
  onBack: () => void;
}

export function PurchaseReturnDetailScreen({ id, onBack }: PurchaseReturnDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: ret, isLoading, refetch } = usePurchaseReturn(id);
  const finalize = useFinalizePurchaseReturn();
  const cancel = useCancelPurchaseReturn();

  const handleFinalize = useCallback(() => {
    Alert.alert('Finalize Return', 'Stock will be deducted. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finalize', style: 'default',
        onPress: async () => {
          try {
            await finalize.mutateAsync(id);
            void refetch();
          } catch {
            Alert.alert('Error', 'Could not finalize return.');
          }
        },
      },
    ]);
  }, [id, finalize, refetch]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancel Return', 'This cannot be undone. Cancel return?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Return', style: 'destructive',
        onPress: async () => {
          try {
            await cancel.mutateAsync(id);
            void refetch();
          } catch {
            Alert.alert('Error', 'Could not cancel return.');
          }
        },
      },
    ]);
  }, [id, cancel, refetch]);

  if (isLoading || !ret) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[ret.status] ?? STATUS_CONFIG.draft;
  const isDraft = ret.status === 'draft';

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#09b6e8', fontSize: 14 }}>← Purchase</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>Return #{ret.returnNumber}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              {ret.supplierName} · Ref: PO #{ret.poNumber}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{fmtDate(ret.createdAt)}</Text>
          </View>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>
            ITEMS RETURNED ({ret.items.length})
          </Text>
          {ret.items.map((item, idx) => (
            <View key={item.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 }} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{item.productName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>
                    Qty: {item.quantityReturned} × {fmt(item.unitCost)}
                  </Text>
                </View>
                <Text style={{ color: '#f59e0b', fontWeight: '700', fontSize: 13 }}>{fmt(item.lineRefund)}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Total Credit</Text>
            <Text style={{ color: '#f59e0b', fontWeight: '900', fontSize: 16 }}>{fmt(ret.totalRefund)}</Text>
          </View>
        </View>

        {ret.reason && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>REASON</Text>
            <Text style={{ color: '#0f172a', fontSize: 14, lineHeight: 20 }}>{ret.reason}</Text>
          </View>
        )}

        {isDraft && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleFinalize}
              disabled={finalize.isPending}
              style={{ flex: 2, backgroundColor: '#22c55e', borderRadius: 12, padding: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                {finalize.isPending ? 'Finalizing…' : '✓ Finalize Return'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={cancel.isPending}
              style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                {cancel.isPending ? '…' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
