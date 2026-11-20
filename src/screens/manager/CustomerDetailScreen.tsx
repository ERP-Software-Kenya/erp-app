import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomer } from '@/hooks/manager/useCustomers';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface CustomerDetailScreenProps {
  id: string;
  onBack: () => void;
  onOpenOrder: (orderId: string) => void;
}

export function CustomerDetailScreen({ id, onBack, onOpenOrder }: CustomerDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: customer, isLoading } = useCustomer(id);

  const handleCall = useCallback(() => {
    if (customer?.phone) void Linking.openURL(`tel:${customer.phone}`);
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b74f5" />
      </View>
    );
  }

  const hasOutstanding = customer.outstandingBalance > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3b74f5', fontSize: 14 }}>← Customers</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 22 }}>{customer.name}</Text>
        {customer.phone && (
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{customer.phone}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        {/* Balance card */}
        <View style={{ backgroundColor: hasOutstanding ? '#fee2e2' : '#d1fae5', borderRadius: 14, padding: 16 }}>
          <Text style={{ color: hasOutstanding ? '#991b1b' : '#065f46', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
            OUTSTANDING BALANCE
          </Text>
          <Text style={{ color: hasOutstanding ? '#ef4444' : '#22c55e', fontSize: 28, fontWeight: '900' }}>
            {fmt(customer.outstandingBalance)}
          </Text>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0', gap: 10 }}>
          {customer.email && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Email</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{customer.email}</Text>
            </View>
          )}
          {customer.address && (
            <View>
              <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>Address</Text>
              <Text style={{ color: '#0f172a', fontSize: 13, lineHeight: 18 }}>{customer.address}</Text>
            </View>
          )}
          {customer.gstNumber && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>GST</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{customer.gstNumber}</Text>
            </View>
          )}
          {customer.createdAt && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Customer since</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmtDate(customer.createdAt)}</Text>
            </View>
          )}
        </View>

        {/* Recent orders */}
        {customer.recentOrders && customer.recentOrders.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>RECENT ORDERS</Text>
            {customer.recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => onOpenOrder(order.id)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
              >
                <View>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>#{order.orderNumber}</Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>{fmtDate(order.createdAt)}</Text>
                </View>
                <Text style={{ color: '#3b74f5', fontWeight: '700', fontSize: 13 }}>{fmt(order.grandTotal)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {customer.phone && (
          <TouchableOpacity
            onPress={handleCall}
            style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ fontSize: 18 }}>📞</Text>
            <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>Call {customer.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
