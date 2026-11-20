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

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
function fieldRole(roles: string[]): UserRole | null {
  if (roles.includes('packer')) return 'packer';
  if (roles.includes('driver')) return 'driver';
  return null;
}

function isTokenExpired(decoded: JwtPayload): boolean {
  return decoded.exp * 1000 < Date.now();
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

  hydrate: (): void => {
    const token = authStorage.getString('jwt');
    if (!token) return;
    const decoded = parseJwtPayload(token);
    if (!decoded || isTokenExpired(decoded)) {
      authStorage.delete('jwt');
      authStorage.set('session-expired', '1');
      return;
    }
    set({
      token,
      userId: decoded.sub,
      role: decoded.role,
      locationId: decoded.locationId,
      organizationId: decoded.organizationId,
    });
  },
}));
