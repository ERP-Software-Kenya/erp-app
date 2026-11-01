import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSupplier } from '@/hooks/manager/useSuppliers';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface SupplierDetailScreenProps {
  id: string;
  onBack: () => void;
  onOpenPO: (poId: string) => void;
}

export function SupplierDetailScreen({ id, onBack, onOpenPO }: SupplierDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: supplier, isLoading } = useSupplier(id);

  const handleCall = useCallback(() => {
    if (supplier?.phone) void Linking.openURL(`tel:${supplier.phone}`);
  }, [supplier]);

  if (isLoading || !supplier) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#09b6e8" />
      </View>
    );
  }

  const hasPayable = supplier.outstandingPayable > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3b74f5', fontSize: 14 }}>← Suppliers</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 22 }}>{supplier.name}</Text>
        {supplier.phone && (
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{supplier.phone}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        {/* Payable card */}
        <View style={{ backgroundColor: hasPayable ? '#fef3c7' : '#d1fae5', borderRadius: 14, padding: 16 }}>
          <Text style={{ color: hasPayable ? '#b45309' : '#065f46', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
            OUTSTANDING PAYABLE
          </Text>
          <Text style={{ color: hasPayable ? '#f59e0b' : '#22c55e', fontSize: 28, fontWeight: '900' }}>
            {fmt(supplier.outstandingPayable)}
          </Text>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0', gap: 10 }}>
          {supplier.email && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Email</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{supplier.email}</Text>
            </View>
          )}
          {supplier.address && (
            <View>
              <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>Address</Text>
              <Text style={{ color: '#0f172a', fontSize: 13, lineHeight: 18 }}>{supplier.address}</Text>
            </View>
          )}
          {supplier.gstNumber && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>GST</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{supplier.gstNumber}</Text>
            </View>
          )}
        </View>

        {/* Recent POs */}
        {supplier.recentPOs && supplier.recentPOs.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>RECENT PURCHASE ORDERS</Text>
            {supplier.recentPOs.map((po) => (
              <TouchableOpacity
                key={po.id}
                onPress={() => onOpenPO(po.id)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
              >
                <View>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>#{po.poNumber}</Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>{fmtDate(po.createdAt)}</Text>
                </View>
                <Text style={{ color: '#09b6e8', fontWeight: '700', fontSize: 13 }}>{fmt(po.grandTotal)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {supplier.phone && (
          <TouchableOpacity
            onPress={handleCall}
            style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ fontSize: 18 }}>📞</Text>
            <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>Call {supplier.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
