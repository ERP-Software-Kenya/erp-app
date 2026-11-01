import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaleOrder } from '@/hooks/manager/useSalesOrders';
import { useRecordSalePayment } from '@/hooks/manager/usePayments';
import type { PaymentMethod } from '@/api/manager/payments.api';

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_CONFIG = {
  pending:   { label: 'PENDING',   bg: '#fef3c7', color: '#b45309' },
  paid:      { label: 'PAID',      bg: '#d1fae5', color: '#065f46' },
  partial:   { label: 'PARTIAL',   bg: '#dbeafe', color: '#1d4ed8' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
} as const;

const METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'bank', label: 'Bank', icon: '🏦' },
  { key: 'upi',  label: 'UPI',  icon: '📱' },
];

// ── record payment modal ──────────────────────────────────────────────────────

function RecordPaymentModal({
  visible,
  orderId,
  outstanding,
  onClose,
}: {
  visible: boolean;
  orderId: string;
  outstanding: number;
  onClose: () => void;
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(String(outstanding));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');
  const record = useRecordSalePayment();

  const handleSubmit = useCallback(async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid payment amount.');
      return;
    }
    try {
      await record.mutateAsync({ orderId, amount: parsed, method, note: note || undefined });
      onClose();
    } catch {
      Alert.alert('Error', 'Could not record payment. Please try again.');
    }
  }, [amount, method, note, orderId, record, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0' }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Text style={{ color: '#3b74f5', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, fontWeight: '800', fontSize: 17, color: '#0f172a' }}>Record Payment</Text>
          <TouchableOpacity onPress={() => void handleSubmit()} disabled={record.isPending}>
            <Text style={{ color: record.isPending ? '#94a3b8' : '#3b74f5', fontWeight: '700', fontSize: 15 }}>
              {record.isPending ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>OUTSTANDING</Text>
            <Text style={{ color: '#ef4444', fontWeight: '900', fontSize: 28 }}>{fmt(outstanding)}</Text>
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>AMOUNT (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', borderBottomWidth: 2, borderBottomColor: '#3b74f5', paddingBottom: 4 }}
            />
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>PAYMENT METHOD</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: method === m.key ? '#3b74f5' : '#f0f4f8',
                    borderWidth: 1,
                    borderColor: method === m.key ? '#3b74f5' : '#dde5f0',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                  <Text style={{ color: method === m.key ? '#ffffff' : '#64748b', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>NOTE (OPTIONAL)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. received via GPay…"
              placeholderTextColor="#94a3b8"
              style={{ color: '#0f172a', fontSize: 14 }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── main screen ───────────────────────────────────────────────────────────────

export interface OrderDetailScreenProps {
  id: string;
  onBack: () => void;
  onNewReturn: (orderId: string) => void;
}

export function OrderDetailScreen({ id, onBack, onNewReturn }: OrderDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, refetch } = useSaleOrder(id);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b74f5" />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3b74f5', fontSize: 14 }}>← Sales</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>Order #{order.orderNumber}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              {order.customerName} · {fmtDate(order.createdAt)}
            </Text>
          </View>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>

        {/* Location */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>LOCATION</Text>
          <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: '600' }}>{order.locationName}</Text>
        </View>

        {/* Items */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>
            ITEMS ({order.items.length})
          </Text>
          {order.items.map((item, idx) => (
            <View key={item.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 }} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{item.productName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>
                    Qty: {item.quantity} × {fmt(item.unitPrice)}
                    {item.discountPercent > 0 ? ` · Disc ${item.discountPercent}%` : ''}
                    {item.taxPercent > 0 ? ` · Tax ${item.taxPercent}%` : ''}
                  </Text>
                </View>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 13 }}>{fmt(item.lineTotal)}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Subtotal</Text>
            <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600' }}>{fmt(order.subtotal)}</Text>
          </View>
          {order.taxTotal > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Tax</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmt(order.taxTotal)}</Text>
            </View>
          )}
          {order.discountTotal > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Discount</Text>
              <Text style={{ color: '#f59e0b', fontSize: 13 }}>−{fmt(order.discountTotal)}</Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: '#dde5f0', marginTop: 10, marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Total</Text>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>{fmt(order.grandTotal)}</Text>
          </View>
        </View>

        {/* Payment summary */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>PAYMENT</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Paid</Text>
            <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 13 }}>{fmt(order.amountPaid)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Outstanding</Text>
            <Text style={{ color: order.outstanding > 0 ? '#ef4444' : '#22c55e', fontWeight: '700', fontSize: 13 }}>
              {fmt(order.outstanding)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {order.outstanding > 0 && (
            <TouchableOpacity
              onPress={() => setPaymentModalOpen(true)}
              style={{ flex: 1, backgroundColor: '#3b74f5', borderRadius: 12, padding: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>💳 Record Payment</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onNewReturn(order.id)}
            style={{ flex: 1, backgroundColor: '#fee2e2', borderRadius: 12, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#991b1b', fontWeight: '700', fontSize: 13 }}>↩ Return</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {order.customerPhone && (
            <TouchableOpacity
              onPress={() => void Linking.openURL(`tel:${order.customerPhone}`)}
              style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0' }}
            >
              <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>📞 Call Customer</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <RecordPaymentModal
        visible={paymentModalOpen}
        orderId={order.id}
        outstanding={order.outstanding}
        onClose={() => {
          setPaymentModalOpen(false);
          void refetch();
        }}
      />
    </View>
  );
}
