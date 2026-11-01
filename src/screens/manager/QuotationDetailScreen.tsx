import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuotation, useConvertQuotationToOrder, useSendQuotationEmail } from '@/hooks/manager/useQuotations';

function fmt(n: number): string { return `₹${n.toLocaleString('en-IN')}`; }
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  draft:     { label: 'DRAFT',     bg: '#f1f5f9', color: '#64748b' },
  sent:      { label: 'SENT',      bg: '#fef3c7', color: '#b45309' },
  converted: { label: 'CONVERTED', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
} as const;

export interface QuotationDetailScreenProps {
  id: string;
  onBack: () => void;
  onOrderCreated: (orderId: string) => void;
}

export function QuotationDetailScreen({ id, onBack, onOrderCreated }: QuotationDetailScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: quote, isLoading, refetch } = useQuotation(id);
  const convert = useConvertQuotationToOrder();
  const sendEmail = useSendQuotationEmail();

  const handleConvert = useCallback(async () => {
    Alert.alert('Convert to Order', 'Create a sales order from this quotation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Convert', style: 'default',
        onPress: async () => {
          try {
            const res = await convert.mutateAsync(id);
            onOrderCreated(res.orderId);
          } catch {
            Alert.alert('Error', 'Could not convert quotation. Please try again.');
          }
        },
      },
    ]);
  }, [id, convert, onOrderCreated]);

  const handleSendEmail = useCallback(async () => {
    try {
      await sendEmail.mutateAsync(id);
      void refetch();
      Alert.alert('Sent', 'Quotation emailed to customer.');
    } catch {
      Alert.alert('Error', 'Could not send email. Please try again.');
    }
  }, [id, sendEmail, refetch]);

  if (isLoading || !quote) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.draft;
  const canAct = quote.status !== 'converted' && quote.status !== 'cancelled';

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#8b5cf6', fontSize: 14 }}>← Quotations</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20 }}>Quote #{quote.quotationNumber}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              {quote.customerName} · {fmtDate(quote.createdAt)}
            </Text>
          </View>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
        {quote.validUntil && (
          <View style={{ marginTop: 8, backgroundColor: '#fef3c7', borderRadius: 8, padding: 7 }}>
            <Text style={{ color: '#b45309', fontSize: 12, fontWeight: '600' }}>⏱ Valid till {fmtDate(quote.validUntil)}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>
            ITEMS ({quote.items.length})
          </Text>
          {quote.items.map((item, idx) => (
            <View key={item.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 }} />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{item.productName}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>
                    {item.quantity} × {fmt(item.unitPrice)}
                    {item.discountPercent > 0 ? ` · Disc ${item.discountPercent}%` : ''}
                  </Text>
                </View>
                <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 13 }}>{fmt(item.lineTotal)}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 10 }} />
          {quote.discountTotal > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Discount</Text>
              <Text style={{ color: '#f59e0b', fontSize: 13 }}>−{fmt(quote.discountTotal)}</Text>
            </View>
          )}
          {quote.taxTotal > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Tax</Text>
              <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmt(quote.taxTotal)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 15 }}>Total</Text>
            <Text style={{ color: '#8b5cf6', fontWeight: '900', fontSize: 16 }}>{fmt(quote.grandTotal)}</Text>
          </View>
        </View>

        {canAct && (
          <>
            <TouchableOpacity
              onPress={() => void handleConvert()}
              disabled={convert.isPending}
              style={{ backgroundColor: '#3b74f5', borderRadius: 12, padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
                {convert.isPending ? 'Converting…' : '🔁 Convert to Order'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => void handleSendEmail()}
                disabled={sendEmail.isPending}
                style={{ flex: 1, backgroundColor: '#d1fae5', borderRadius: 12, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 13 }}>
                  {sendEmail.isPending ? 'Sending…' : '📧 Send Email'}
                </Text>
              </TouchableOpacity>
              {quote.customerPhone && (
                <TouchableOpacity
                  onPress={() => void Linking.openURL(`tel:${quote.customerPhone}`)}
                  style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0' }}
                >
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>📞 Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
