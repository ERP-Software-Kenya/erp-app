import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { DrawerProvider } from '@/components/navigation/DrawerContext';
import { DrawerPanel } from '@/components/navigation/DrawerPanel';
import { DrawerContent } from '@/components/navigation/DrawerContent';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', href: '/(branch-manager)/' },
  { label: 'Orders', icon: '📦', href: '/(branch-manager)/orders' },
  { label: 'Inventory', icon: '🏪', href: '/(branch-manager)/inventory' },
  { label: 'Notifications', icon: '🔔', href: '/(shared)/notifications' },
];

export default function BranchManagerLayout(): React.ReactElement {
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
              title: 'Dashboard',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>📊</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>📦</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="inventory"
            options={{
              title: 'Inventory',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>🏪</Text>
              ),
            }}
          />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Branch Manager" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}
