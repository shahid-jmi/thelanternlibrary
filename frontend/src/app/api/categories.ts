import { api } from './client';
import type { AdminCategory, CategoryPayload, PublicCategory } from './types';

export async function getCategories(lang: string): Promise<PublicCategory[]> {
  const { data } = await api.get<PublicCategory[]>('/categories', { params: { lang } });
  if (!Array.isArray(data)) {
    throw new Error(
      'The categories API did not return a category list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data } = await api.get<AdminCategory[]>('/admin/categories');
  if (!Array.isArray(data)) {
    throw new Error(
      'The admin categories API did not return a category list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function createCategory(payload: CategoryPayload): Promise<AdminCategory> {
  const { data } = await api.post<AdminCategory>('/admin/categories', payload);
  return data;
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<AdminCategory> {
  const { data } = await api.put<AdminCategory>(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/categories/${id}`);
  return data;
}
