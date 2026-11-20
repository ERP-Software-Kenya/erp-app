import { apiClient } from './client';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'failed';

export interface PublicInvitation {
  organizationName: string;
  invitedEmailMasked?: string;
  roleName: string;
  status: InvitationStatus;
  expiresAt: string;
  appLink?: string;
  androidInstallUrl?: string;
  iosInstallUrl?: string;
  desktopInstallUrl?: string;
}

export interface AcceptedInvitation {
  organization: { id: string; name: string };
  membership: {
    id: string;
    status: string;
    role: string;
    locationIds: string[];
  };
}

export async function getPublicInvitationApi(token: string): Promise<PublicInvitation> {
  const response = await apiClient.get<PublicInvitation>(
    `/v1/public/organization-invitations/${encodeURIComponent(token)}`,
  );
  return response.data;
}

export async function acceptInvitationApi(token: string): Promise<AcceptedInvitation> {
  const response = await apiClient.post<AcceptedInvitation>(
    `/v1/organization-invitations/${encodeURIComponent(token)}/accept`,
  );
  return response.data;
}
