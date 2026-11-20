import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { useAuthStore } from '@/store/auth.store';
import { useClerk } from '@clerk/expo';

export interface MoreScreenNavProps {
  onOpenCustomers: () => void;
  onOpenSuppliers: () => void;
  onOpenProducts: () => void;
  onNotifications?: () => void;
}

function MenuRow({
  icon, label, subtitle, onPress, color = '#0f172a',
}: {
  icon: string; label: string; subtitle?: string; onPress: () => void; color?: string;
}): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color, fontWeight: '600', fontSize: 15 }}>{label}</Text>
        {subtitle && <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      <Text style={{ color: '#94a3b8', fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}

export function MoreScreen({ onOpenCustomers, onOpenSuppliers, onOpenProducts, onNotifications }: MoreScreenNavProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { role, organizationId } = useAuthStore();
  const { signOut } = useClerk();

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <AppHeader title="More" onNotifications={onNotifications} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Profile card */}
        <View style={{ margin: 16, backgroundColor: '#0d1b3e', borderRadius: 16, padding: 16 }}>
          <Text style={{ color: '#93a5c4', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
            {role === 'org-admin' ? 'Org Admin' : 'Branch Manager'}
          </Text>
          {organizationId && (
            <Text style={{ color: '#93a5c4', fontSize: 13 }}>Org: {organizationId}</Text>
          )}
        </View>

        {/* Contacts section */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>CONTACTS</Text>
          <MenuRow icon="👥" label="Customers" subtitle="View, search and add customers" onPress={onOpenCustomers} />
          <MenuRow icon="🏭" label="Suppliers" subtitle="View, search and add suppliers" onPress={onOpenSuppliers} />
          <MenuRow icon="📦" label="Products" subtitle="Add, edit and manage product catalogue" onPress={onOpenProducts} />
        </View>

        {/* App section */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>APP</Text>
          <MenuRow icon="🔔" label="Notifications" onPress={() => onNotifications?.()} />
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
            onPress={() => void signOut()}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </View>
            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 15, flex: 1 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
