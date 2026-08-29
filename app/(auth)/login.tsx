import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { loginApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import type { JwtPayload } from '../../src/store/auth.store';

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export default function LoginScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await loginApi({ email: email.trim(), password });
      const decoded = parseJwtPayload(token);
      if (!decoded) {
        Alert.alert('Error', 'Invalid token received.');
        return;
      }
      setAuth(token, decoded);
      if (decoded.role === 'PICKER') {
        router.replace('/(picker)');
      } else {
        router.replace('/(driver)');
      }
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

      <KeyboardAvoidingView
        className="flex-1 justify-center px-8"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white tracking-tight">ERP Field</Text>
          <Text className="text-cyan text-sm mt-2 tracking-widest uppercase">
            Warehouse &amp; Delivery Operations
          </Text>
        </View>

        {/* Card */}
        <View className="rounded-3xl overflow-hidden border border-white/10 bg-white/10 p-6 gap-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="bg-white/10 rounded-xl px-4 h-12 text-white text-base border border-white/20"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoComplete="password"
            className="bg-white/10 rounded-xl px-4 h-12 text-white text-base border border-white/20"
          />
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
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
