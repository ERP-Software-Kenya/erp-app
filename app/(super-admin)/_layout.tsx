import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, type ColorValue } from 'react-native';
import { DrawerProvider } from '@/components/navigation/DrawerContext';
import { DrawerPanel } from '@/components/navigation/DrawerPanel';
import { DrawerContent } from '@/components/navigation/DrawerContent';

const NAV_ITEMS = [
  { label: 'Platform', icon: '⚡', href: '/(super-admin)/' },
  { label: 'Analytics', icon: '📈', href: '/(super-admin)/analytics' },
  { label: 'Notifications', icon: '🔔', href: '/(shared)/notifications' },
];

export default function SuperAdminLayout(): React.ReactElement {
  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b74f5',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#dde5f0' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Platform',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color: color as string }}>⚡</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color: color as string }}>📈</Text>
              ),
            }}
          />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Super Admin" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}
