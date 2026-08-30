import { api } from '@/app/api/client';
import type { AdminCategory, CategoryPayload, PublicCategory } from '@/app/api/types';

export async function getCategories(lang: string): Promise<PublicCategory[]> {
  const { data } = await api.get<PublicCategory[]>('/categories', { params: { lang } });
  if (!Array.isArray(data)) {
    throw new Error(
      'The categories API did not return a category list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getCategoryBySlug(slug: string, lang: string): Promise<PublicCategory> {
  const { data } = await api.get<PublicCategory>(`/categories/${slug}`, { params: { lang } });
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error(
      'The category API did not return a category. Check VITE_API_URL or start the backend server.'
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

function buildCategoryFormData(payload: CategoryPayload, coverImageFile: File | null): FormData {
  const formData = new FormData();
  formData.append('name', JSON.stringify(payload.name));
  formData.append('slug', payload.slug);
  if (payload.tagline) {
    formData.append('tagline', JSON.stringify(payload.tagline));
  }
  if (payload.description) {
    formData.append('description', JSON.stringify(payload.description));
  }
  formData.append('isActive', String(payload.isActive));
  if (coverImageFile) {
    formData.append('coverImage', coverImageFile);
  }
  return formData;
}

export async function createCategory(
  payload: CategoryPayload,
  coverImageFile: File | null
): Promise<AdminCategory> {
  const { data } = await api.post<AdminCategory>(
    '/admin/categories',
    buildCategoryFormData(payload, coverImageFile)
  );
  return data;
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
  coverImageFile: File | null
): Promise<AdminCategory> {
  const { data } = await api.put<AdminCategory>(
    `/admin/categories/${id}`,
    buildCategoryFormData(payload, coverImageFile)
  );
  return data;
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/categories/${id}`);
  return data;
}
