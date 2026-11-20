import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateSaleReturn } from '@/hooks/manager/useSalesReturns';
import { useSaleOrder } from '@/hooks/manager/useSalesOrders';
import { useSalesOrders } from '@/hooks/manager/useSalesOrders';
import type { CreateSaleReturnPayload } from '@/api/manager/sales-returns.api';

interface ReturnLine {
  orderItemId: string;
  productName: string;
  quantityOrdered: number;
  quantityReturnable: number;
  quantityReturned: number;
  unitPrice: number;
}

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }

export interface NewReturnScreenProps {
  orderId?: string;
  onBack: () => void;
  onSuccess: (returnId: string) => void;
}

export function NewReturnScreen({ orderId: prefillOrderId, onBack, onSuccess }: NewReturnScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const create = useCreateSaleReturn();
  const [orderSearch, setOrderSearch] = useState('');
  const deferredSearch = useDeferredValue(orderSearch);
  const { data: orders } = useSalesOrders({ search: deferredSearch || undefined, perPage: 5 });

  const [selectedOrderId, setSelectedOrderId] = useState(prefillOrderId ?? '');
  const { data: selectedOrder } = useSaleOrder(selectedOrderId);

  const [returnLines, setReturnLines] = useState<ReturnLine[]>([]);
  const [reason, setReason] = useState('');

  const initLines = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setReturnLines([]);
  }, []);

  React.useEffect(() => {
    if (selectedOrder && returnLines.length === 0) {
      setReturnLines(
        selectedOrder.items.map((item) => ({
          orderItemId: item.id,
          productName: item.productName,
          quantityOrdered: item.quantity,
          quantityReturnable: item.quantity,
          quantityReturned: 0,
          unitPrice: item.unitPrice,
        }))
      );
    }
  }, [selectedOrder, returnLines.length]);

  const updateQty = useCallback((idx: number, delta: number) => {
    setReturnLines((prev) => prev.map((line, i) => {
      if (i !== idx) return line;
      const qty = Math.max(0, Math.min(line.quantityReturnable, line.quantityReturned + delta));
      return { ...line, quantityReturned: qty };
    }));
  }, []);

  const totalRefund = returnLines.reduce(
    (s, l) => s + l.quantityReturned * l.unitPrice, 0
  );
  const hasItems = returnLines.some((l) => l.quantityReturned > 0);

  const handleSubmit = useCallback(async () => {
    if (!selectedOrderId) { Alert.alert('No order', 'Select an order first.'); return; }
    if (!hasItems) { Alert.alert('No items', 'Select at least one item to return.'); return; }
    const payload: CreateSaleReturnPayload = {
      orderId: selectedOrderId,
      reason: reason || undefined,
      items: returnLines
        .filter((l) => l.quantityReturned > 0)
        .map((l) => ({ orderItemId: l.orderItemId, quantityReturned: l.quantityReturned })),
    };
    try {
      const created = await create.mutateAsync(payload);
      onSuccess(created.id);
    } catch {
      Alert.alert('Error', 'Could not create return. Please try again.');
    }
  }, [selectedOrderId, hasItems, reason, returnLines, create, onSuccess]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#ef4444', fontSize: 14 }}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>New Sales Return</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* Order selector */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>ORIGINAL ORDER</Text>
          {selectedOrder ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>#{selectedOrder.orderNumber}</Text>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{selectedOrder.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelectedOrderId(''); setReturnLines([]); }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                value={orderSearch}
                onChangeText={setOrderSearch}
                placeholder="Search order number or customer…"
                placeholderTextColor="#94a3b8"
                style={{ color: '#0f172a', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingBottom: 6 }}
              />
              {orderSearch.length > 1 && orders?.data.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => { initLines(o.id); setOrderSearch(''); }}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                >
                  <Text style={{ color: '#0f172a', fontWeight: '600' }}>#{o.orderNumber} — {o.customerName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{fmt(o.grandTotal)}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Return items */}
        {returnLines.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>SELECT ITEMS TO RETURN</Text>
            {returnLines.map((line, idx) => (
              <View key={line.orderItemId} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{line.productName}</Text>
                    <Text style={{ color: '#64748b', fontSize: 11 }}>
                      Ordered: {line.quantityOrdered} · Returnable: {line.quantityReturnable}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateQty(idx, -1)}
                      style={{ width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#ef4444' }}>−</Text>
                    </TouchableOpacity>
                    <View style={{ width: 36, height: 30, borderRadius: 8, borderWidth: 1, borderColor: line.quantityReturned > 0 ? '#ef4444' : '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#0f172a', fontWeight: '700' }}>{line.quantityReturned}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateQty(idx, 1)}
                      style={{ width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#ef4444' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {line.quantityReturned > 0 && (
                  <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    Refund: {fmt(line.quantityReturned * line.unitPrice)}
                  </Text>
                )}
              </View>
            ))}
            {hasItems && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#dde5f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#0f172a', fontWeight: '800' }}>Total Refund</Text>
                <Text style={{ color: '#ef4444', fontWeight: '900', fontSize: 16 }}>{fmt(totalRefund)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Reason */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>REASON</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Damaged packaging, quality issue…"
            placeholderTextColor="#94a3b8"
            multiline
            style={{ color: '#0f172a', fontSize: 14, minHeight: 60 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={create.isPending || !hasItems}
          style={{ backgroundColor: create.isPending || !hasItems ? '#fca5a5' : '#ef4444', borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          {create.isPending
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Submit Return</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
