import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreatePurchaseReturn } from '@/hooks/manager/usePurchaseReturns';
import { usePurchaseOrder } from '@/hooks/manager/usePurchaseOrders';
import { usePurchaseOrdersInfinite } from '@/hooks/manager/usePurchaseOrders';
import type { CreatePurchaseReturnPayload } from '@/api/manager/purchase-returns.api';

interface ReturnLine {
  orderItemId: string;
  productName: string;
  quantityReceived: number;
  quantityReturnable: number;
  quantityReturned: number;
  unitCost: number;
}

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }

export interface NewPurchaseReturnScreenProps {
  poId?: string;
  onBack: () => void;
  onSuccess: (returnId: string) => void;
}

export function NewPurchaseReturnScreen({ poId: prefillPoId, onBack, onSuccess }: NewPurchaseReturnScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const create = useCreatePurchaseReturn();
  const [orderSearch, setOrderSearch] = useState('');
  const deferredSearch = useDeferredValue(orderSearch);
  const { data: orders } = usePurchaseOrdersInfinite({ search: deferredSearch || undefined, status: 'received' });

  const [selectedPoId, setSelectedPoId] = useState(prefillPoId ?? '');
  const { data: selectedPO } = usePurchaseOrder(selectedPoId);
  const [returnLines, setReturnLines] = useState<ReturnLine[]>([]);
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (selectedPO && returnLines.length === 0) {
      setReturnLines(
        selectedPO.items.map((item) => ({
          orderItemId: item.id,
          productName: item.productName,
          quantityReceived: item.quantityReceived ?? item.quantity,
          quantityReturnable: item.quantityReceived ?? item.quantity,
          quantityReturned: 0,
          unitCost: item.unitCost,
        }))
      );
    }
  }, [selectedPO, returnLines.length]);

  const updateQty = useCallback((idx: number, delta: number) => {
    setReturnLines((prev) => prev.map((line, i) => {
      if (i !== idx) return line;
      const qty = Math.max(0, Math.min(line.quantityReturnable, line.quantityReturned + delta));
      return { ...line, quantityReturned: qty };
    }));
  }, []);

  const totalCredit = returnLines.reduce((s, l) => s + l.quantityReturned * l.unitCost, 0);
  const hasItems = returnLines.some((l) => l.quantityReturned > 0);

  const handleSubmit = useCallback(async () => {
    if (!selectedPoId) { Alert.alert('No PO', 'Select a purchase order first.'); return; }
    if (!hasItems) { Alert.alert('No items', 'Select at least one item to return.'); return; }
    const payload: CreatePurchaseReturnPayload = {
      purchaseOrderId: selectedPoId,
      reason: reason || undefined,
      items: returnLines
        .filter((l) => l.quantityReturned > 0)
        .map((l) => ({ purchaseOrderItemId: l.orderItemId, quantityReturned: l.quantityReturned })),
    };
    try {
      const created = await create.mutateAsync(payload);
      onSuccess(created.id);
    } catch {
      Alert.alert('Error', 'Could not create return. Please try again.');
    }
  }, [selectedPoId, hasItems, reason, returnLines, create, onSuccess]);

  const poRows = orders?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#f59e0b', fontSize: 14 }}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>New Purchase Return</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* PO selector */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>PURCHASE ORDER</Text>
          {selectedPO ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>#{selectedPO.poNumber}</Text>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{selectedPO.supplierName}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelectedPoId(''); setReturnLines([]); }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                value={orderSearch}
                onChangeText={setOrderSearch}
                placeholder="Search PO number or supplier…"
                placeholderTextColor="#94a3b8"
                style={{ color: '#0f172a', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingBottom: 6 }}
              />
              {orderSearch.length > 1 && poRows.map((po) => (
                <TouchableOpacity
                  key={po.id}
                  onPress={() => { setSelectedPoId(po.id); setOrderSearch(''); }}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                >
                  <Text style={{ color: '#0f172a', fontWeight: '600' }}>#{po.poNumber} — {po.supplierName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{fmt(po.grandTotal)}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {returnLines.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>SELECT ITEMS TO RETURN</Text>
            {returnLines.map((line, idx) => (
              <View key={line.orderItemId} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{line.productName}</Text>
                    <Text style={{ color: '#64748b', fontSize: 11 }}>Received: {line.quantityReceived}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateQty(idx, -1)}
                      style={{ width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#f59e0b' }}>−</Text>
                    </TouchableOpacity>
                    <View style={{ width: 36, height: 30, borderRadius: 8, borderWidth: 1, borderColor: line.quantityReturned > 0 ? '#f59e0b' : '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#0f172a', fontWeight: '700' }}>{line.quantityReturned}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateQty(idx, 1)}
                      style={{ width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#f59e0b' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {line.quantityReturned > 0 && (
                  <Text style={{ color: '#f59e0b', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    Credit: {fmt(line.quantityReturned * line.unitCost)}
                  </Text>
                )}
              </View>
            ))}
            {hasItems && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#dde5f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#0f172a', fontWeight: '800' }}>Total Credit</Text>
                <Text style={{ color: '#f59e0b', fontWeight: '900', fontSize: 16 }}>{fmt(totalCredit)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>REASON</Text>
          <TextInput value={reason} onChangeText={setReason} placeholder="Defective, wrong item delivered…" placeholderTextColor="#94a3b8" multiline style={{ color: '#0f172a', fontSize: 14, minHeight: 60 }} />
        </View>

        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={create.isPending || !hasItems}
          style={{ backgroundColor: create.isPending || !hasItems ? '#fcd34d' : '#f59e0b', borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          {create.isPending
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Submit Purchase Return</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
