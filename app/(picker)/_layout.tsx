import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, type ColorValue } from 'react-native';
import { DrawerProvider } from '@/components/navigation/DrawerContext';
import { DrawerPanel } from '@/components/navigation/DrawerPanel';
import { DrawerContent } from '@/components/navigation/DrawerContent';
import { useCentrifugo } from '../../src/hooks/useCentrifugo';

const NAV_ITEMS = [
  { label: 'Order Queue', icon: '📦', href: '/(picker)/' },
  { label: 'Active Order', icon: '⚡', href: '/(picker)/active' },
  { label: 'History', icon: '📋', href: '/(picker)/history' },
  { label: 'Notifications', icon: '🔔', href: '/(shared)/notifications' },
];

export default function PickerLayout(): React.ReactElement {
  useCentrifugo();

  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b74f5',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#dde5f0' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Queue',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>📦</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="active"
            options={{
              title: 'Active',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>⚡</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>📋</Text>
              ),
            }}
          />
          <Tabs.Screen name="[orderId]" options={{ href: null }} />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Packer" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}
