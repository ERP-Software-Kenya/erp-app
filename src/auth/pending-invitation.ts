import * as SecureStore from 'expo-secure-store';

const PENDING_INVITATION_KEY = 'erp.pending-organization-invitation';

export async function savePendingInvitationToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(PENDING_INVITATION_KEY, token);
}

export async function getPendingInvitationToken(): Promise<string | null> {
  return SecureStore.getItemAsync(PENDING_INVITATION_KEY);
}

export async function clearPendingInvitationToken(): Promise<void> {
  await SecureStore.deleteItemAsync(PENDING_INVITATION_KEY);
}
