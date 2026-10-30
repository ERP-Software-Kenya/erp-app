import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps): React.ReactElement {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
      <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 17, textAlign: 'center' }}>{title}</Text>
      {subtitle ? <Text style={{ color: '#64748b', fontSize: 13, marginTop: 6, textAlign: 'center' }}>{subtitle}</Text> : null}
    </View>
  );
}
