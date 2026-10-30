import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking as NativeLinking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth, useClerk } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { AxiosError } from 'axios';
import {
  acceptInvitationApi,
  getPublicInvitationApi,
  type PublicInvitation,
} from '../../../src/api/invitations.api';
import {
  clearPendingInvitationToken,
  savePendingInvitationToken,
} from '../../../src/auth/pending-invitation';

type ScreenState = 'loading' | 'ready' | 'accepting' | 'accepted' | 'error';

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    if (data?.code === 'INVITATION_EMAIL_MISMATCH') {
      return data.message ?? 'Sign in with the email address that received this invitation.';
    }
    if (data?.code === 'INVITATION_EXPIRED' || error.response?.status === 410) {
      return 'This invitation has expired. Ask your administrator to send a new one.';
    }
    if (data?.code === 'INVITATION_REVOKED') {
      return 'This invitation was revoked by your administrator.';
    }
    return data?.message ?? 'Unable to process this invitation.';
  }
  return error instanceof Error ? error.message : 'Unable to process this invitation.';
}

export default function InviteAcceptanceScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { startHostedAuth } = useHostedAuth();
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [state, setState] = useState<ScreenState>('loading');
  const [message, setMessage] = useState<string | null>(null);

  const loadInvitation = useCallback(async (): Promise<void> => {
    if (!token || token.length < 16) {
      setMessage('This invitation link is invalid.');
      setState('error');
      return;
    }
    setState('loading');
    setMessage(null);
    try {
      const result = await getPublicInvitationApi(token);
      if (result.status !== 'pending') {
        throw new Error(
          result.status === 'accepted'
            ? 'This invitation has already been accepted.'
            : `This invitation is ${result.status}. Ask your administrator for a new invitation.`,
        );
      }
      await savePendingInvitationToken(token);
      setInvitation(result);
      setState('ready');
    } catch (error) {
      if (error instanceof AxiosError && (error.response?.status === 404 || error.response?.status === 410)) {
        await clearPendingInvitationToken();
      }
      setMessage(errorMessage(error));
      setState('error');
    }
  }, [token]);

  useEffect(() => {
    void loadInvitation();
  }, [loadInvitation]);

  const accept = useCallback(async (): Promise<void> => {
    if (!token) return;
    setState('accepting');
    setMessage(null);
    try {
      await acceptInvitationApi(token);
      await clearPendingInvitationToken();
      setState('accepted');
      setTimeout(() => router.replace('/'), 700);
    } catch (error) {
      setMessage(errorMessage(error));
      setState('error');
    }
  }, [token]);

  const authenticate = async (mode: 'sign-in' | 'sign-up'): Promise<void> => {
    setState('accepting');
    setMessage(null);
    try {
      const result = await startHostedAuth({
        mode,
        redirectUrl: Linking.createURL('auth-callback', { scheme: 'erpapp' }),
      });
      if (!result.createdSessionId) {
        setState('ready');
        return;
      }
      await accept();
    } catch (error) {
      setMessage(errorMessage(error));
      setState('error');
    }
  };

  const busy = state === 'loading' || state === 'accepting' || !isLoaded;

  return (
    <View
      className="flex-1 bg-navy px-6 justify-center"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="rounded-3xl border border-white/10 bg-white/10 p-6">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Organization invitation
        </Text>

        {busy && <ActivityIndicator className="my-8" color="#ffffff" size="large" />}

        {!busy && invitation && state !== 'error' && (
          <>
            <Text className="text-slate-200 text-center text-base mb-2">
              Join {invitation.organizationName}
            </Text>
            <Text className="text-cyan text-center font-semibold mb-1">
              {invitation.roleName}
            </Text>
            {invitation.invitedEmailMasked && (
              <Text className="text-slate-400 text-center text-sm mb-6">
                Invited account: {invitation.invitedEmailMasked}
              </Text>
            )}

            {Platform.OS === 'web' && (
              <View className="gap-2 mb-6">
                {invitation.appLink && (
                  <TouchableOpacity className="bg-primary rounded-xl py-3" onPress={() => void NativeLinking.openURL(invitation.appLink!)}>
                    <Text className="text-white text-center font-bold">Open ERP app</Text>
                  </TouchableOpacity>
                )}
                {invitation.androidInstallUrl && (
                  <TouchableOpacity className="border border-white/20 rounded-xl py-3" onPress={() => void NativeLinking.openURL(invitation.androidInstallUrl!)}>
                    <Text className="text-white text-center font-bold">Install Android app</Text>
                  </TouchableOpacity>
                )}
                {invitation.iosInstallUrl && (
                  <TouchableOpacity className="border border-white/20 rounded-xl py-3" onPress={() => void NativeLinking.openURL(invitation.iosInstallUrl!)}>
                    <Text className="text-white text-center font-bold">Install iOS app</Text>
                  </TouchableOpacity>
                )}
                <Text className="text-slate-400 text-center text-xs">
                  After installing, return to the invitation email and open this link again.
                </Text>
              </View>
            )}

            {state === 'accepted' ? (
              <Text className="text-green-300 text-center font-semibold">Invitation accepted</Text>
            ) : isSignedIn ? (
              <TouchableOpacity className="bg-primary rounded-xl py-3" onPress={() => void accept()}>
                <Text className="text-white text-center font-bold">Accept invitation</Text>
              </TouchableOpacity>
            ) : (
              <View className="gap-3">
                <TouchableOpacity
                  className="bg-primary rounded-xl py-3"
                  onPress={() => void authenticate('sign-up')}
                >
                  <Text className="text-white text-center font-bold">Create account and join</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="border border-white/20 rounded-xl py-3"
                  onPress={() => void authenticate('sign-in')}
                >
                  <Text className="text-white text-center font-bold">Sign in and join</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {state === 'error' && (
          <>
            <Text className="text-red-200 text-center mb-6">{message}</Text>
            <View className="gap-3">
              {isSignedIn && invitation && (
                <TouchableOpacity
                  className="bg-primary rounded-xl py-3"
                  onPress={() => void signOut().then(() => setState('ready'))}
                >
                  <Text className="text-white text-center font-bold">Use another account</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity className="border border-white/20 rounded-xl py-3" onPress={() => void loadInvitation()}>
                <Text className="text-white text-center font-bold">Try again</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
