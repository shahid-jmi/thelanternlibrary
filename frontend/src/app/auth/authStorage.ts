import type { AdminRole } from '@/app/api/types';

const ADMIN_TOKEN_KEY = 'bookstore-admin-token';
const MUST_CHANGE_PASSWORD_KEY = 'bookstore-admin-must-change-password';

export interface AdminTokenClaims {
  sub: string;
  role: AdminRole;
}

export function getToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
}

// The JWT payload intentionally omits mustChangePassword (it's mutable
// state, not identity), so it's tracked separately here — set at login,
// cleared once the admin sets their own password.
export function getMustChangePassword(): boolean {
  return localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true';
}

export function setMustChangePassword(value: boolean): void {
  if (value) {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true');
  } else {
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
  }
}

export function decodeAdminToken(token: string): AdminTokenClaims | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') return null;
    return { sub: decoded.sub, role: decoded.role };
  } catch {
    return null;
  }
}

export function getCurrentAdmin(): AdminTokenClaims | null {
  const token = getToken();
  if (!token) return null;
  return decodeAdminToken(token);
}
