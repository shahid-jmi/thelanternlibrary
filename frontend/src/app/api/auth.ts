import { api } from './client';
import type { AdminRole } from './types';

export interface LoginResult {
  token: string;
  mustChangePassword: boolean;
  admin: {
    id: string;
    email: string;
    role: AdminRole;
  };
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post<LoginResult>('/admin/auth/login', { email, password });
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/admin/auth/change-password', { currentPassword, newPassword });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/admin/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/admin/auth/reset-password', { token, newPassword });
}
