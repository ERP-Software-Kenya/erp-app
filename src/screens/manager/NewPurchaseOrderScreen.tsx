import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreatePurchaseOrder } from '@/hooks/manager/usePurchaseOrders';
import { useSuppliers } from '@/hooks/manager/useSuppliers';
import type { CreatePurchaseOrderPayload } from '@/api/manager/purchase-orders.api';

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  taxPercent: number;
}

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function lineTotal(i: LineItem): number {
  return Math.round(i.unitCost * i.quantity * (1 + i.taxPercent / 100));
}

export interface NewPurchaseOrderScreenProps {
  onBack: () => void;
  onSuccess: (poId: string) => void;
}

export function NewPurchaseOrderScreen({ onBack, onSuccess }: NewPurchaseOrderScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const create = useCreatePurchaseOrder();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data: suppliers } = useSuppliers({ search: deferredSearch || undefined });

  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);

  const updateQty = useCallback((idx: number, delta: number) => {
    setItems((prev) => prev.map((item, i) =>
      i !== idx ? item : { ...item, quantity: Math.max(1, item.quantity + delta) }
    ));
  }, []);

  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const total = items.reduce((s, i) => s + lineTotal(i), 0);

  const handleSubmit = useCallback(async () => {
    if (!supplierId && !supplierName.trim()) {
      Alert.alert('Supplier required', 'Select or enter a supplier.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('No items', 'Add at least one product.');
      return;
    }
    const payload: CreatePurchaseOrderPayload = {
      supplierId: supplierId || undefined,
      supplierName: supplierId ? undefined : supplierName,
      expectedDelivery: expectedDelivery || undefined,
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        taxPercent: i.taxPercent || undefined,
      })),
    };
    try {
      const created = await create.mutateAsync(payload);
      onSuccess(created.id);
    } catch {
      Alert.alert('Error', 'Could not create purchase order. Please try again.');
    }
  }, [supplierId, supplierName, expectedDelivery, notes, items, create, onSuccess]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#09b6e8', fontSize: 14 }}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>New Purchase Order</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* Supplier */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>SUPPLIER</Text>
          <TextInput
            value={supplierName || search}
            onChangeText={(t) => { setSearch(t); setSupplierId(''); setSupplierName(''); }}
            placeholder="Search supplier…"
            placeholderTextColor="#94a3b8"
            style={{ color: '#0f172a', fontSize: 15, borderBottomWidth: 1, borderBottomColor: supplierId ? '#09b6e8' : '#dde5f0', paddingBottom: 6 }}
          />
          {!supplierId && search.length > 1 && suppliers?.data.slice(0, 5).map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setSupplierId(s.id); setSupplierName(s.name); setSearch(''); }}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
            >
              <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{s.name}</Text>
              {s.phone && <Text style={{ color: '#64748b', fontSize: 12 }}>{s.phone}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Expected delivery */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>EXPECTED DELIVERY</Text>
          <TextInput
            value={expectedDelivery}
            onChangeText={setExpectedDelivery}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#94a3b8"
            style={{ color: '#0f172a', fontSize: 15 }}
          />
        </View>

        {/* Products */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>PRODUCTS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 }}>
            <Text style={{ color: '#64748b', marginRight: 6 }}>🔍</Text>
            <TextInput placeholder="Search product to order…" placeholderTextColor="#94a3b8" style={{ flex: 1, paddingVertical: 10, color: '#0f172a', fontSize: 14 }} />
            <TouchableOpacity><Text style={{ fontSize: 18 }}>📷</Text></TouchableOpacity>
          </View>
          {items.length === 0 && (
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
              Search or scan to add products
            </Text>
          )}
          {items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{item.productName}</Text>
                <Text style={{ color: '#09b6e8', fontWeight: '700', fontSize: 13 }}>{fmt(lineTotal(item))}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity onPress={() => updateQty(idx, -1)} style={{ width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#09b6e8' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ width: 24, textAlign: 'center', fontWeight: '700' }}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQty(idx, 1)} style={{ width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#09b6e8' }}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(idx)} style={{ marginLeft: 4 }}>
                  <Text style={{ color: '#ef4444', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {items.length > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: '#64748b', fontWeight: '600' }}>Total</Text>
              <Text style={{ color: '#09b6e8', fontWeight: '900', fontSize: 16 }}>{fmt(total)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>NOTES (OPTIONAL)</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Delivery instructions, terms…" placeholderTextColor="#94a3b8" multiline style={{ color: '#0f172a', fontSize: 14, minHeight: 48 }} />
        </View>

        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={create.isPending}
          style={{ backgroundColor: create.isPending ? '#7dd3fc' : '#09b6e8', borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          {create.isPending
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Place Purchase Order →</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
