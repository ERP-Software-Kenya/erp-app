import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useClerk } from '@clerk/expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PendingRoleScreen(): React.ReactElement {
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-surface items-center justify-center px-8" style={{ paddingBottom: insets.bottom }}>
      <Text className="text-6xl mb-6">⏳</Text>
      <Text className="text-text font-black text-2xl text-center mb-3">Account pending setup</Text>
      <Text className="text-muted text-center text-base leading-6 mb-8">
        Your account has been created but no role has been assigned yet.{'\n'}Contact your administrator to get access.
      </Text>
      <TouchableOpacity
        className="bg-primary px-8 py-3.5 rounded-xl"
        onPress={(): void => { void signOut(); }}
        activeOpacity={0.85}
      >
        <Text className="text-white font-bold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
