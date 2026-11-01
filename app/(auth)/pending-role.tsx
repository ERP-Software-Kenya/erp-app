import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useClerk } from '@clerk/expo';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMeApi, syncUserApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';

type CheckState = 'idle' | 'checking' | 'still-pending';

export default function PendingRoleScreen(): React.ReactElement {
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();
  const { setProfile } = useAuthStore();
  const [checkState, setCheckState] = useState<CheckState>('idle');

  const handleCheckAgain = async (): Promise<void> => {
    setCheckState('checking');
    try {
      await syncUserApi();
      const profile = await getMeApi();
      const hasRole = profile.roles.some((r) =>
        ['packer', 'driver', 'org-admin', 'branch-manager', 'super-admin'].includes(r),
      );
      if (!hasRole) {
        setCheckState('still-pending');
        return;
      }
      setProfile(profile);
      if (profile.roles.includes('super-admin')) router.replace('/(super-admin)');
      else if (profile.roles.includes('org-admin')) router.replace('/(org-admin)');
      else if (profile.roles.includes('branch-manager')) router.replace('/(branch-manager)');
      else if (profile.roles.includes('packer')) router.replace('/(picker)');
      else if (profile.roles.includes('driver')) router.replace('/(driver)');
    } catch {
      setCheckState('still-pending');
    }
  };

  return (
    <View
      className="flex-1 bg-surface items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom }}
    >
      <Text className="text-6xl mb-6">⏳</Text>
      <Text className="text-text font-black text-2xl text-center mb-3">
        Account pending setup
      </Text>
      <Text className="text-muted text-center text-base leading-6 mb-8">
        Your account has been created but no role has been assigned yet.{'\n'}
        Contact your administrator to get access.
      </Text>

      {checkState === 'still-pending' && (
        <View
          style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f59e0b4d', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, width: '100%' }}
        >
          <Text style={{ color: '#f59e0b', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
            Still no role assigned. Ask your admin to assign you a role, then try again.
          </Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-primary w-full py-3.5 rounded-xl items-center mb-3"
        onPress={(): void => { void handleCheckAgain(); }}
        disabled={checkState === 'checking'}
        activeOpacity={0.85}
      >
        {checkState === 'checking' ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-base">Check again</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full py-3.5 rounded-xl items-center border border-border"
        onPress={(): void => { void signOut(); }}
        activeOpacity={0.7}
      >
        <Text className="text-muted font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
