import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignUp, useOAuth } from '@clerk/expo';
import * as Linking from 'expo-linking';

type AuthMethod = 'password' | 'otp';
type OtpStage = 'send' | 'verify';

function clerkMsg(error: unknown, fallback: string): string {
  const e = error as { errors?: { code?: string; message?: string; longMessage?: string }[] };
  const first = e?.errors?.[0];
  if (first?.longMessage) return first.longMessage;
  if (first?.message) return first.message;
  return (error as Error)?.message || fallback;
}

export default function SignUpScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { signUp, fetchStatus } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [otpStage, setOtpStage] = useState<OtpStage>('send');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (method: AuthMethod) => {
    setAuthMethod(method);
    setOtpStage('send');
    setOtpCode('');
  };

  const handlePasswordSignUp = async () => {
    if (fetchStatus !== 'idle') return;
    setLoading(true);
    try {
      const { error: createError } = await signUp.create({ emailAddress: email.trim(), password });
      if (createError) {
        Alert.alert('Sign up failed', clerkMsg(createError, 'Please check your details.'));
        return;
      }
      const { error: emailError } = await signUp.verifications.sendEmailCode();
      if (emailError) {
        Alert.alert('Sign up failed', clerkMsg(emailError, 'Could not send verification code.'));
        return;
      }
      router.push('/(auth)/verify-email');
    } catch (err) {
      Alert.alert('Sign up failed', clerkMsg(err, 'Please check your details.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSignUp = async () => {
    if (fetchStatus !== 'idle') return;
    setLoading(true);
    try {
      const { error: createError } = await signUp.create({ emailAddress: email.trim() });
      if (createError) {
        Alert.alert('Sign up failed', clerkMsg(createError, 'Please try again.'));
        return;
      }
      const { error: emailError } = await signUp.verifications.sendEmailCode();
      if (emailError) {
        Alert.alert('Sign up failed', clerkMsg(emailError, 'Could not send verification code.'));
        return;
      }
      setOtpStage('verify');
    } catch (err) {
      Alert.alert('Sign up failed', clerkMsg(err, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSignUp = async () => {
    if (fetchStatus !== 'idle') return;
    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: otpCode.trim() });
      if (error) {
        Alert.alert('Verification failed', clerkMsg(error, 'Invalid or expired code.'));
        return;
      }
      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.replace('/');
      } else {
        Alert.alert('Verification failed', 'Could not complete sign-up. Please try again.');
      }
    } catch (err) {
      Alert.alert('Verification failed', clerkMsg(err, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/', { scheme: 'erpapp' }),
      });
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      Alert.alert('Google sign-in failed', clerkMsg(err, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0d1b3e' }}
    >
      <View style={{ position: 'absolute', top: -80, left: -60, width: 256, height: 256, borderRadius: 128, backgroundColor: '#3b74f5', opacity: 0.2 }} />
      <View style={{ position: 'absolute', bottom: -60, right: -30, width: 224, height: 224, borderRadius: 112, backgroundColor: '#1e3a8a', opacity: 0.25 }} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>ERP Field</Text>
          <Text style={{ color: '#09b6e8', fontSize: 11, marginTop: 4, letterSpacing: 3 }}>WAREHOUSE & DELIVERY OPERATIONS</Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 20 }}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Create your account</Text>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 3, marginBottom: 20, gap: 4 }}>
            {(['password', 'otp'] as AuthMethod[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => switchTab(m)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: authMethod === m ? '#3b74f5' : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ color: authMethod === m ? '#ffffff' : '#94a3b8', fontWeight: '600', fontSize: 13 }}>
                  {m === 'password' ? 'Password' : 'Email OTP'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Password sign-up */}
          {authMethod === 'password' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>EMAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@company.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
                />
              </View>
              <View>
                <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>PASSWORD</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="min. 8 characters"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  autoComplete="new-password"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
                />
              </View>
              <TouchableOpacity
                onPress={() => void handlePasswordSignUp()}
                disabled={loading || !email.trim() || password.length < 8}
                style={{ backgroundColor: loading || !email.trim() || password.length < 8 ? '#1e40af' : '#3b74f5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
              >
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Create Account</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* OTP sign-up */}
          {authMethod === 'otp' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>EMAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@company.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={otpStage === 'send'}
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: otpStage === 'verify' ? '#64748b' : '#ffffff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
                />
              </View>
              {otpStage === 'verify' && (
                <View>
                  <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>VERIFICATION CODE</Text>
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="6-digit code"
                    placeholderTextColor="#475569"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={6}
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, borderWidth: 1, borderColor: '#09b6e8', color: '#ffffff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 22, letterSpacing: 6, textAlign: 'center' }}
                  />
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>Code sent to {email}</Text>
                </View>
              )}
              {otpStage === 'send' ? (
                <TouchableOpacity
                  onPress={() => void handleOtpSignUp()}
                  disabled={loading || !email.trim()}
                  style={{ backgroundColor: loading || !email.trim() ? '#1e40af' : '#3b74f5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
                >
                  {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Send code</Text>}
                </TouchableOpacity>
              ) : (
                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => void handleVerifyOtpSignUp()}
                    disabled={loading || otpCode.length < 6}
                    style={{ backgroundColor: loading || otpCode.length < 6 ? '#1e40af' : '#3b74f5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                  >
                    {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Verify & Create Account</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setOtpStage('send'); setOtpCode(''); }} style={{ paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>← Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <Text style={{ color: '#64748b', fontSize: 11 }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </View>

          <TouchableOpacity
            onPress={() => void handleGoogle()}
            disabled={loading}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 13 }}
          >
            <Text style={{ fontSize: 18 }}>G</Text>
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, paddingVertical: 6, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Already have an account?{' '}
              <Text style={{ color: '#09b6e8', fontWeight: '700' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
