import type { AdminRole } from '../api/types';

const ADMIN_TOKEN_KEY = 'bookstore-admin-token';

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
