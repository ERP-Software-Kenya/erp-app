import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { DrawerProvider } from '@/components/navigation/DrawerContext';
import { DrawerPanel } from '@/components/navigation/DrawerPanel';
import { DrawerContent } from '@/components/navigation/DrawerContent';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', href: '/(org-admin)/' },
  { label: 'Live Fleet', icon: '🗺️', href: '/(org-admin)/fleet' },
  { label: 'Order Queue', icon: '📦', href: '/(org-admin)/orders' },
  { label: 'Stock Alerts', icon: '⚠️', href: '/(org-admin)/alerts' },
];

export default function OrgAdminLayout(): React.ReactElement {
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
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>📊</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="fleet"
            options={{
              title: 'Fleet',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🗺️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>📦</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="alerts"
            options={{
              title: 'Alerts',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>⚠️</Text>
              ),
            }}
          />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Org Admin" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}
