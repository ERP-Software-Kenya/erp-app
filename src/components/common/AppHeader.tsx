import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawer } from '../navigation/DrawerContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  notificationCount?: number;
  onNotifications?: () => void;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, notificationCount = 0, onNotifications, right }: AppHeaderProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();

  return (
    <View
      style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 10 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          onPress={openDrawer}
          activeOpacity={0.7}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 18, color: '#0f172a' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 18, letterSpacing: -0.3 }}>{title}</Text>
          {subtitle ? <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{subtitle}</Text> : null}
        </View>
        {right}
        {onNotifications && (
          <TouchableOpacity
            onPress={onNotifications}
            activeOpacity={0.7}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {notificationCount > 0 && (
              <View style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '700' }}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
