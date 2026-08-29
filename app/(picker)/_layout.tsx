import React from 'react';
import { Tabs } from 'expo-router';
import { useCentrifugo } from '../../src/hooks/useCentrifugo';

export default function PickerLayout(): React.ReactElement {
  useCentrifugo();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b74f5',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#dde5f0' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Queue' }} />
      <Tabs.Screen name="[orderId]" options={{ href: null }} />
      <Tabs.Screen name="active" options={{ title: 'Active' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}
