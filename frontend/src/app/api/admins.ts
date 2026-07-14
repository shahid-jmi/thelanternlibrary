import { api } from './client';
import type { AdminAccount, AdminRole, CreateAdminPayload } from './types';

export async function getAdmins(): Promise<AdminAccount[]> {
  const { data } = await api.get<AdminAccount[]>('/admin/admins');
  if (!Array.isArray(data)) {
    throw new Error(
      'The admins API did not return a list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminAccount> {
  const { data } = await api.post<AdminAccount>('/admin/admins', payload);
  return data;
}

export async function deleteAdmin(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/admins/${id}`);
  return data;
}

export async function deactivateAdmin(id: string): Promise<AdminAccount> {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/deactivate`);
  return data;
}

export async function reactivateAdmin(id: string): Promise<AdminAccount> {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/reactivate`);
  return data;
}

export async function updateAdminRole(id: string, role: AdminRole): Promise<AdminAccount> {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/role`, { role });
  return data;
}
