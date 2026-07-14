import { api } from './client';
import type { AdminBook, BookFilters, BookPayload, PublicBook } from './types';

function compactParams(params: BookFilters) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
}

export async function getBooks(filters: BookFilters): Promise<PublicBook[]> {
  const { data } = await api.get<PublicBook[]>('/books', { params: compactParams(filters) });
  if (!Array.isArray(data)) {
    throw new Error(
      'The books API did not return a book list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getBook(id: string, lang: string): Promise<PublicBook> {
  const { data } = await api.get<PublicBook>(`/books/${id}`, { params: { lang } });
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error(
      'The book API did not return a book. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getAdminBooks(): Promise<AdminBook[]> {
  const { data } = await api.get<AdminBook[]>('/admin/books');
  if (!Array.isArray(data)) {
    throw new Error(
      'The admin books API did not return a book list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

function buildBookFormData(payload: BookPayload, coverImageFile: File | null): FormData {
  const formData = new FormData();
  formData.append('title', JSON.stringify(payload.title));
  formData.append('description', JSON.stringify(payload.description));
  formData.append('author', payload.author);
  formData.append('price', String(payload.price));
  formData.append('genre', payload.genre);
  formData.append('language', payload.language);
  formData.append('isAvailable', String(payload.isAvailable));
  if (coverImageFile) {
    formData.append('coverImage', coverImageFile);
  }
  return formData;
}

export async function createBook(
  payload: BookPayload,
  coverImageFile: File | null
): Promise<AdminBook> {
  const { data } = await api.post<AdminBook>(
    '/admin/books',
    buildBookFormData(payload, coverImageFile)
  );
  return data;
}

export async function updateBook(
  id: string,
  payload: BookPayload,
  coverImageFile: File | null
): Promise<AdminBook> {
  const { data } = await api.put<AdminBook>(
    `/admin/books/${id}`,
    buildBookFormData(payload, coverImageFile)
  );
  return data;
}

export async function deleteBook(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/books/${id}`);
  return data;
}

export async function toggleAvailability(id: string, isAvailable: boolean): Promise<AdminBook> {
  const { data } = await api.patch<AdminBook>(`/admin/books/${id}/availability`, { isAvailable });
  return data;
}
