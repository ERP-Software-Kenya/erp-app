import React from 'react';
import { View, Text } from 'react-native';

export type OrderStatus = 'queue' | 'claimed' | 'packed' | 'urgent' | 'delivered' | 'in_transit' | 'pending';

interface Config { label: string; bg: string; text: string; }

const CONFIG: Record<OrderStatus, Config> = {
  queue:      { label: 'IN QUEUE',   bg: '#fef3c7', text: '#b45309' },
  claimed:    { label: 'CLAIMED',    bg: '#dbeafe', text: '#1d4ed8' },
  packed:     { label: 'PACKED',     bg: '#d1fae5', text: '#065f46' },
  urgent:     { label: 'URGENT',     bg: '#fef2f2', text: '#dc2626' },
  delivered:  { label: 'DELIVERED',  bg: '#d1fae5', text: '#065f46' },
  in_transit: { label: 'IN TRANSIT', bg: '#dbeafe', text: '#1d4ed8' },
  pending:    { label: 'PENDING',    bg: '#f1f5f9', text: '#64748b' },
};

export function StatusBadge({ status }: { status: OrderStatus }): React.ReactElement {
  const c = CONFIG[status] ?? CONFIG.pending;
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
      <Text style={{ color: c.text, fontSize: 10, fontWeight: '700' }}>{c.label}</Text>
    </View>
  );
}
