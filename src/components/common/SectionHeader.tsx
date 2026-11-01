import React from 'react';
import { View, Text } from 'react-native';

interface SectionHeaderProps { title: string; count?: number; color?: string; }

export function SectionHeader({ title, count, color = '#64748b' }: SectionHeaderProps): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color, letterSpacing: 0.8, flex: 1 }}>{title.toUpperCase()}</Text>
      {count !== undefined && (
        <View style={{ backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
          <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{count}</Text>
        </View>
      )}
    </View>
  );
}
