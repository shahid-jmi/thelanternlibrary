import { api } from './client';
import type { AdminProduct, ProductFilters, ProductPayload, PublicProduct } from './types';

function compactParams(params: ProductFilters) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
}

export async function getProducts(filters: ProductFilters): Promise<PublicProduct[]> {
  const { data } = await api.get<PublicProduct[]>('/products', { params: compactParams(filters) });
  if (!Array.isArray(data)) {
    throw new Error(
      'The products API did not return a product list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getProduct(id: string, lang: string): Promise<PublicProduct> {
  const { data } = await api.get<PublicProduct>(`/products/${id}`, { params: { lang } });
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error(
      'The product API did not return a product. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data } = await api.get<AdminProduct[]>('/admin/products');
  if (!Array.isArray(data)) {
    throw new Error(
      'The admin products API did not return a product list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

function buildProductFormData(payload: ProductPayload, coverImageFile: File | null): FormData {
  const formData = new FormData();
  formData.append('name', JSON.stringify(payload.name));
  formData.append('description', JSON.stringify(payload.description));
  formData.append('category', payload.category);
  formData.append('price', String(payload.price));
  formData.append('isAvailable', String(payload.isAvailable));
  if (coverImageFile) {
    formData.append('coverImage', coverImageFile);
  }
  return formData;
}

export async function createProduct(
  payload: ProductPayload,
  coverImageFile: File | null
): Promise<AdminProduct> {
  const { data } = await api.post<AdminProduct>(
    '/admin/products',
    buildProductFormData(payload, coverImageFile)
  );
  return data;
}

export async function updateProduct(
  id: string,
  payload: ProductPayload,
  coverImageFile: File | null
): Promise<AdminProduct> {
  const { data } = await api.put<AdminProduct>(
    `/admin/products/${id}`,
    buildProductFormData(payload, coverImageFile)
  );
  return data;
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/products/${id}`);
  return data;
}

export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<AdminProduct> {
  const { data } = await api.patch<AdminProduct>(`/admin/products/${id}/availability`, {
    isAvailable,
  });
  return data;
}
