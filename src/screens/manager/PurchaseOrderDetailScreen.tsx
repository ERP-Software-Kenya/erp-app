import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal,
  TextInput, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  usePurchaseOrder, usePurchasePayments,
  useReceiveGoods, useRecordPurchasePayment,
} from '@/hooks/manager/usePurchaseOrders';
import type { PurchaseOrderStatus } from '@/api/manager/purchase-orders.api';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  ordered:   { label: 'ORDERED',   bg: '#dbeafe', color: '#1d4ed8' },
  partial:   { label: 'PARTIAL',   bg: '#fef3c7', color: '#b45309' },
  received:  { label: 'RECEIVED',  bg: '#d1fae5', color: '#065f46' },
  paid:      { label: 'PAID',      bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

type PaymentMethod = 'cash' | 'bank' | 'upi' | 'cheque';
const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'cash', label: 'Cash' }, { key: 'bank', label: 'Bank' },
  { key: 'upi', label: 'UPI' }, { key: 'cheque', label: 'Cheque' },
];

function RecordPaymentModal({
  visible, maxAmount, onClose, onSubmit, isPending,
}: {
  visible: boolean; maxAmount: number; onClose: () => void;
  onSubmit: (amount: number, method: PaymentMethod, note?: string) => void;
  isPending: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState(String(maxAmount));
  const [method, setMethod] = useState<PaymentMethod>('bank');
  const [note, setNote] = useState('');
  React.useEffect(() => { if (visible) { setAmount(String(maxAmount)); setNote(''); } }, [visible, maxAmount]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 18, marginBottom: 16 }}>Record Payment</Text>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>AMOUNT</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={{ backgroundColor: '#f0f4f8', borderRadius: 10, padding: 12, fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 14 }} />
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>METHOD</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity key={m.key} onPress={() => setMethod(m.key)}
                style={{ flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 2, borderColor: method === m.key ? '#09b6e8' : '#dde5f0', backgroundColor: method === m.key ? '#e0f7fd' : '#f8fafc', alignItems: 'center' }}>
                <Text style={{ color: method === m.key ? '#09b6e8' : '#64748b', fontWeight: '700', fontSize: 12 }}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>NOTE (OPTIONAL)</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Reference, invoice #…" placeholderTextColor="#94a3b8" style={{ backgroundColor: '#f0f4f8', borderRadius: 10, padding: 12, color: '#0f172a', marginBottom: 18 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isPending}
              onPress={() => { const a = parseFloat(amount); if (!isNaN(a) && a > 0) onSubmit(a, method, note || undefined); }}
              style={{ flex: 2, borderRadius: 12, padding: 14, backgroundColor: isPending ? '#7dd3fc' : '#09b6e8', alignItems: 'center' }}>
              {isPending ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700' }}>Record</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export interface PurchaseOrderDetailScreenProps {
  id: string;
  onBack: () => void;
  onNewReturn: (poId: string) => void;
}

export function PurchaseOrderDetailScreen({ id, onBack, onNewReturn }: PurchaseOrderDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const { data: payments } = usePurchasePayments(id);
  const receiveGoods = useReceiveGoods();
  const recordPayment = useRecordPurchasePayment();
  const [payModal, setPayModal] = useState(false);

  const handleReceive = useCallback(() => {
    if (!po) return;
    Alert.alert('Mark as Received', 'Confirm goods received from supplier?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', style: 'default',
        onPress: async () => {
          try {
            await receiveGoods.mutateAsync({ id, payload: { items: po.items.map((i) => ({ orderItemId: i.id, quantityReceived: i.quantity - (i.quantityReceived ?? 0) })) } });
            void refetch();
          } catch {
            Alert.alert('Error', 'Could not mark as received.');
          }
        },
      },
    ]);
  }, [po, id, receiveGoods, refetch]);

  const handlePayment = useCallback(async (amount: number, method: string, note?: string) => {
    try {
      await recordPayment.mutateAsync({ id, payload: { amount, paymentMethod: method as never, note } });
      setPayModal(false);
      void refetch();
    } catch {
      Alert.alert('Error', 'Could not record payment.');
    }
  }, [id, recordPayment, refetch]);

  if (isLoading || !po) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#09b6e8" />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[po.status] ?? STATUS_CONFIG.draft;
  const canReceive = po.status === 'ordered' || po.status === 'partial';
  const outstanding = po.grandTotal - (po.amountPaid ?? 0);
  const canPay = outstanding > 0 && po.status !== 'cancelled';

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#09b6e8', fontSize: 14 }}>← Purchase</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>PO #{po.poNumber}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              {po.supplierName} · {fmtDate(po.createdAt)}
            </Text>
            {po.expectedDelivery && (
              <Text style={{ color: '#f59e0b', fontSize: 12, marginTop: 1 }}>Expected: {fmtDate(po.expectedDelivery)}</Text>
            )}
          </View>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        {/* Items */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>ITEMS ({po.items.length})</Text>
          {po.items.map((item, idx) => (
            <View key={item.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 }} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{item.productName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>
                    {item.quantity} × {fmt(item.unitCost)}
                  </Text>
                  {item.quantityReceived != null && (
                    <Text style={{ color: item.quantityReceived >= item.quantity ? '#22c55e' : '#f59e0b', fontSize: 11, marginTop: 1 }}>
                      Received: {item.quantityReceived}/{item.quantity}
                    </Text>
                  )}
                </View>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 13 }}>{fmt(item.lineTotal)}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 10 }} />
          {po.taxTotal > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Tax</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmt(po.taxTotal)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Total</Text>
            <Text style={{ color: '#09b6e8', fontWeight: '900', fontSize: 16 }}>{fmt(po.grandTotal)}</Text>
          </View>
        </View>

        {/* Payment status */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>PAYMENT</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Total</Text>
            <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{fmt(po.grandTotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Paid</Text>
            <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 13 }}>{fmt(po.amountPaid ?? 0)}</Text>
          </View>
          {outstanding > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>Outstanding</Text>
              <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 14 }}>{fmt(outstanding)}</Text>
            </View>
          )}
          {/* Payment history */}
          {payments && payments.length > 0 && (
            <>
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 }} />
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>HISTORY</Text>
              {payments.map((pmt) => (
                <View key={pmt.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View>
                    <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600' }}>{fmt(pmt.amount)}</Text>
                    <Text style={{ color: '#64748b', fontSize: 11 }}>{pmt.paymentMethod.toUpperCase()} · {fmtDate(pmt.paidAt)}</Text>
                  </View>
                  {pmt.note && <Text style={{ color: '#94a3b8', fontSize: 11, maxWidth: 140 }} numberOfLines={1}>{pmt.note}</Text>}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Actions */}
        {canReceive && (
          <TouchableOpacity
            onPress={handleReceive}
            disabled={receiveGoods.isPending}
            style={{ backgroundColor: '#d1fae5', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#6ee7b7' }}
          >
            <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 14 }}>
              {receiveGoods.isPending ? 'Processing…' : '📦 Mark as Received'}
            </Text>
          </TouchableOpacity>
        )}
        {canPay && (
          <TouchableOpacity
            onPress={() => setPayModal(true)}
            style={{ backgroundColor: '#09b6e8', borderRadius: 12, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>💳 Record Payment</Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => onNewReturn(id)}
            style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' }}
          >
            <Text style={{ color: '#b45309', fontWeight: '600', fontSize: 13 }}>↩ Return</Text>
          </TouchableOpacity>
          {po.supplierPhone && (
            <TouchableOpacity
              onPress={() => void Linking.openURL(`tel:${po.supplierPhone}`)}
              style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0' }}
            >
              <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>📞 Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <RecordPaymentModal
        visible={payModal}
        maxAmount={outstanding}
        onClose={() => setPayModal(false)}
        onSubmit={handlePayment}
        isPending={recordPayment.isPending}
      />
    </View>
  );
}
