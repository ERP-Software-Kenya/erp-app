import { create } from 'zustand';

export type UserRole = 'packer' | 'driver';

export interface AuthProfile {
  id: string;
  clerkUserId: string;
  email: string;
  roles: string[];
  isOnboarded: boolean;
  organization?: { id: string; name: string };
  locationIds: string[];
  hasOrgWideAccess: boolean;
  branchId?: string;
}

export interface AuthState {
  isReady: boolean;
  userId: string | null;
  role: UserRole | null;
  locationIds: string[];
  organizationId: string | null;
  setProfile: (profile: AuthProfile) => void;
  markReady: () => void;
  clearAuth: () => void;
}

function fieldRole(roles: string[]): UserRole | null {
  if (roles.includes('packer')) return 'packer';
  if (roles.includes('driver')) return 'driver';
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isReady: false,
  userId: null,
  role: null,
  locationIds: [],
  organizationId: null,

  setProfile: (profile: AuthProfile): void => {
    set({
      isReady: true,
      userId: profile.id,
      role: fieldRole(profile.roles),
      locationIds: profile.locationIds,
      organizationId: profile.organization?.id ?? null,
    });
  },

  markReady: (): void => set({ isReady: true }),

  clearAuth: (): void => {
    set({
      isReady: true,
      userId: null,
      role: null,
      locationIds: [],
      organizationId: null,
    });
  },
}));
