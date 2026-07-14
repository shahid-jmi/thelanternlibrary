import { api } from './client';

export async function loginAdmin(email: string, password: string): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>('/admin/auth/login', { email, password });
  return data;
}
