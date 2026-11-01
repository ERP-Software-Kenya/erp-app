import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { DrawerProvider } from '@/components/navigation/DrawerContext';
import { DrawerPanel } from '@/components/navigation/DrawerPanel';
import { DrawerContent } from '@/components/navigation/DrawerContent';

const NAV_ITEMS = [
  { label: 'Home',      icon: '🏠', href: '/(org-admin)/'         },
  { label: 'Sales',     icon: '🛒', href: '/(org-admin)/sales'     },
  { label: 'Purchase',  icon: '🛍️', href: '/(org-admin)/purchase'  },
  { label: 'Inventory', icon: '📦', href: '/(org-admin)/inventory' },
  { label: 'Fleet',     icon: '🗺️', href: '/(org-admin)/fleet'     },
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
              title: 'Home',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>🏠</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="sales"
            options={{
              title: 'Sales',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>🛒</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="purchase"
            options={{
              title: 'Purchase',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>🛍️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="inventory"
            options={{
              title: 'Inventory',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>📦</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: 'More',
              tabBarIcon: ({ color }: { color: ColorValue }) => (
                <Text style={{ fontSize: 20, color }}>⋯</Text>
              ),
            }}
          />
          {/* Hidden detail / create screens */}
          <Tabs.Screen name="orders"           options={{ href: null }} />
          <Tabs.Screen name="alerts"           options={{ href: null }} />
          <Tabs.Screen name="fleet"            options={{ href: null }} />
          <Tabs.Screen name="order/[id]"       options={{ href: null }} />
          <Tabs.Screen name="new-order"        options={{ href: null }} />
          <Tabs.Screen name="quotation/[id]"   options={{ href: null }} />
          <Tabs.Screen name="new-quotation"    options={{ href: null }} />
          <Tabs.Screen name="return/[id]"      options={{ href: null }} />
          <Tabs.Screen name="new-return"       options={{ href: null }} />
          <Tabs.Screen name="customer/[id]"          options={{ href: null }} />
          <Tabs.Screen name="supplier/[id]"          options={{ href: null }} />
          <Tabs.Screen name="customers"              options={{ href: null }} />
          <Tabs.Screen name="suppliers"              options={{ href: null }} />
          <Tabs.Screen name="purchase-order/[id]"   options={{ href: null }} />
          <Tabs.Screen name="new-purchase-order"     options={{ href: null }} />
          <Tabs.Screen name="purchase-return/[id]"  options={{ href: null }} />
          <Tabs.Screen name="new-purchase-return"    options={{ href: null }} />
          <Tabs.Screen name="inventory-item/[id]"   options={{ href: null }} />
          <Tabs.Screen name="stock-transfer/[id]"   options={{ href: null }} />
          <Tabs.Screen name="new-stock-transfer"     options={{ href: null }} />
          <Tabs.Screen name="products"               options={{ href: null }} />
          <Tabs.Screen name="product/[id]"           options={{ href: null }} />
          <Tabs.Screen name="new-product"            options={{ href: null }} />
        </Tabs>
        <DrawerPanel>
          <DrawerContent rolePill="Org Admin" navItems={NAV_ITEMS} />
        </DrawerPanel>
      </View>
    </DrawerProvider>
  );
}
