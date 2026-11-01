import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/expo';

function clerkMsg(error: unknown, fallback: string): string {
  const e = error as { errors?: { message?: string; longMessage?: string }[] };
  const first = e?.errors?.[0];
  return first?.longMessage ?? first?.message ?? (error as Error)?.message ?? fallback;
}

export default function VerifySecondFactorScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { signIn, fetchStatus } = useSignIn();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (fetchStatus !== 'idle') return;
    setLoading(true);
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) {
        Alert.alert('Verification failed', clerkMsg(error, 'Invalid or expired code.'));
        return;
      }
      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.replace('/');
      } else {
        Alert.alert('Verification failed', `Unexpected status: ${signIn.status}`);
      }
    } catch (err) {
      Alert.alert('Verification failed', clerkMsg(err, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0d1b3e', paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(59,116,245,0.2)', borderWidth: 2, borderColor: '#3b74f5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32 }}>🔐</Text>
          </View>
          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22 }}>Two-factor verification</Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            A verification code was sent to your email. Enter it to complete sign-in.
          </Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 20, gap: 16 }}>
          <View>
            <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>VERIFICATION CODE</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, borderWidth: 2, borderColor: code.length > 0 ? '#3b74f5' : 'rgba(255,255,255,0.15)', color: '#ffffff', paddingHorizontal: 14, paddingVertical: 16, fontSize: 28, letterSpacing: 8, textAlign: 'center' }}
            />
          </View>

          <TouchableOpacity
            onPress={() => void handleVerify()}
            disabled={loading || code.length < 6}
            style={{ backgroundColor: loading || code.length < 6 ? '#1e40af' : '#3b74f5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Verify</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ paddingVertical: 6, alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>← Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
