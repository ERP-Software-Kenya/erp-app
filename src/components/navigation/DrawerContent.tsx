import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { useClerk } from '@clerk/expo';
import { useAuthStore } from '../../store/auth.store';
import { useDrawer } from './DrawerContext';

export interface DrawerNavItem {
  label: string;
  icon: string;
  href: string;
}

interface DrawerContentProps {
  rolePill: string;
  navItems: DrawerNavItem[];
}

export function DrawerContent({ rolePill, navItems }: DrawerContentProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { closeDrawer } = useDrawer();
  const userId = useAuthStore((s) => s.userId);

  const navigate = (href: string): void => {
    closeDrawer();
    setTimeout(() => router.push(href as Parameters<typeof router.push>[0]), 230);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#0d1b3e' }}>
      {/* Brand */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1e3a5f' }}>
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 }}>Pramukh</Text>
        <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '500', marginTop: 1 }}>Digital ERP</Text>
        <View style={{ marginTop: 12, backgroundColor: 'rgba(59,116,245,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700' }}>{rolePill}</Text>
        </View>
      </View>

      {/* Nav items */}
      <ScrollView style={{ flex: 1, paddingVertical: 8 }}>
        {navItems.map((item) => {
          const groupBase = item.href.split('/').slice(0, 2).join('/');
          const isActive = pathname.startsWith(groupBase);
          return (
            <TouchableOpacity
              key={item.href}
              onPress={() => navigate(item.href)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                marginBottom: 2,
                backgroundColor: isActive ? '#1e3a5f' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
              <Text style={{ fontWeight: '600', fontSize: 14, color: isActive ? '#ffffff' : '#bfdbfe', flex: 1 }}>
                {item.label}
              </Text>
              {isActive && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b74f5' }} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Profile + Sign out */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1e3a5f', paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          onPress={() => navigate('/(shared)/profile')}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
              {(userId ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>My Profile</Text>
            <Text style={{ color: '#60a5fa', fontSize: 11, marginTop: 1 }}>Settings & account</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(): void => { closeDrawer(); void signOut(); }}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(127,29,29,0.3)' }}
        >
          <Text style={{ fontSize: 16 }}>🚪</Text>
          <Text style={{ color: '#f87171', fontWeight: '600', fontSize: 13 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
