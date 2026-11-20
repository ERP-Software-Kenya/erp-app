import React from 'react';
import { View, Text } from 'react-native';

type Accent = 'blue' | 'green' | 'amber' | 'red';

const ACCENT_COLORS: Record<Accent, string> = {
  blue: '#3b74f5',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

interface KpiCardProps {
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accent?: Accent;
}

export function KpiCard({ value, label, trend, trendUp, accent = 'blue' }: KpiCardProps): React.ReactElement {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderTopWidth: 3, borderTopColor: ACCENT_COLORS[accent] }}>
      <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 22, lineHeight: 26 }}>{value}</Text>
      <Text style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>{label}</Text>
      {trend !== undefined && (
        <Text style={{ fontSize: 11, fontWeight: '600', marginTop: 4, color: trendUp === true ? '#22c55e' : trendUp === false ? '#ef4444' : '#94a3b8' }}>
          {trend}
        </Text>
      )}
    </View>
  );
}
