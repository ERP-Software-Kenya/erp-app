import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useHostedAuth } from '@clerk/expo/hosted-auth';

export default function LoginScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { startHostedAuth } = useHostedAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await startHostedAuth({
        mode: 'sign-in',
        redirectUrl: Linking.createURL('auth-callback', { scheme: 'erpapp' }),
      });
      if (!result.createdSessionId) return;
      router.replace('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Wrong credentials or network error.';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="flex-1 bg-navy"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Blob accents */}
      <View className="absolute top-[-80] left-[-60] w-64 h-64 rounded-full bg-primary opacity-20" />
      <View className="absolute top-24 right-[-40] w-48 h-48 rounded-full bg-cyan opacity-15" />
      <View className="absolute bottom-[-60] right-[-30] w-56 h-56 rounded-full bg-primary-dark opacity-25" />

      <View className="flex-1 justify-center px-8">
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white tracking-tight">ERP Field</Text>
          <Text className="text-cyan text-sm mt-2 tracking-widest uppercase">
            Warehouse &amp; Delivery Operations
          </Text>
        </View>

        {/* Card */}
        <View className="rounded-3xl overflow-hidden border border-white/10 bg-white/10 p-6 gap-4">
          <Text className="text-slate-200 text-center text-sm">
            Continue with secure Clerk authentication. Verification, MFA, and password recovery are handled automatically.
          </Text>
          <TouchableOpacity
            className={[
              'rounded-xl h-12 items-center justify-center mt-2',
              loading ? 'bg-primary/60' : 'bg-primary',
            ].join(' ')}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Continue to Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
