import { create } from 'zustand';
import { authStorage } from '../api/client';

export type UserRole = 'PICKER' | 'DRIVER';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  locationId: string;
  organizationId: string;
  iat: number;
  exp: number;
}

export interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  locationId: string | null;
  organizationId: string | null;
  setAuth: (token: string, decoded: JwtPayload) => void;
  clearAuth: () => void;
  hydrate: () => void;
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
}

function isTokenExpired(decoded: JwtPayload): boolean {
  return decoded.exp * 1000 < Date.now();
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  locationId: null,
  organizationId: null,

  setAuth: (token: string, decoded: JwtPayload): void => {
    authStorage.set('jwt', token);
    set({
      token,
      userId: decoded.sub,
      role: decoded.role,
      locationId: decoded.locationId,
      organizationId: decoded.organizationId,
    });
  },

  clearAuth: (): void => {
    authStorage.delete('jwt');
    set({
      token: null,
      userId: null,
      role: null,
      locationId: null,
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
