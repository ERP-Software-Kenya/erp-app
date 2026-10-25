import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useClerk } from '@clerk/expo';
import { endCurrentSessionApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { stopGpsTask } from '../(driver)/_layout';

export default function ProfileScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { userId, role, clearAuth } = useAuthStore();
  const { signOut } = useClerk();

  const handleLogout = (): void => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await endCurrentSessionApi().catch(() => undefined);
            await stopGpsTask();
            clearAuth();
            await signOut();
            router.replace('/(auth)/login');
          })();
        },
      },
    ]);
  };

  return (
    <View
      className="flex-1 bg-surface px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom }}
    >
      <Text className="text-text font-bold text-2xl mb-6">Profile</Text>

      <View className="bg-white rounded-2xl border border-border p-5 mb-4">
        <Text className="text-muted text-xs font-semibold uppercase mb-1">User ID</Text>
        <Text className="text-text font-medium text-sm">{userId ?? '—'}</Text>
        <View className="h-px bg-border my-3" />
        <Text className="text-muted text-xs font-semibold uppercase mb-1">Role</Text>
        <Text className="text-text font-medium text-sm">{role ?? '—'}</Text>
      </View>

      <TouchableOpacity
        className="bg-destructive/10 rounded-2xl py-4 items-center border border-destructive/20"
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text className="text-destructive font-bold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
