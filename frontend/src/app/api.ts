import axios, { AxiosError } from 'axios';

export const BOOK_GENRES = [
  'fiction',
  'non-fiction',
  'poetry',
  'religious',
  'children',
  'history',
  'science',
  'other',
] as const;

export const BOOK_LANGUAGES = ['english', 'urdu', 'persian', 'arabic', 'other'] as const;
export const TRANSLATION_LANGUAGES = ['en', 'ur'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookLanguage = (typeof BOOK_LANGUAGES)[number];
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

export interface CoverImage {
  url: string;
  publicId: string | null;
}

export interface PublicBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  coverImage: CoverImage;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBook extends Omit<PublicBook, 'title' | 'description'> {
  title: {
    en: string;
    ur?: string;
  };
  description: {
    en: string;
    ur?: string;
  };
}

export interface BookPayload {
  title: {
    en: string;
    ur?: string;
  };
  description: {
    en: string;
    ur?: string;
  };
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  isAvailable: boolean;
}

export interface BookFilters {
  lang?: string;
  search?: string;
  genre?: string;
  language?: string;
  available?: string;
}

export const ADMIN_ROLES = ['admin', 'super_admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminAccount {
  _id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  role: AdminRole;
}

interface AdminTokenClaims {
  sub: string;
  role: AdminRole;
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

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookstore-admin-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown) {
  const response = (error as AxiosError<{ message?: string; details?: Array<{ msg: string }> }>).response;
  const details = response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((detail) => detail.msg).join(' ');
  }
  if (error instanceof Error && !response) return error.message;
  return response?.data?.message || 'Something went wrong. Please try again.';
}

export async function getBooks(filters: BookFilters) {
  const { data } = await api.get<PublicBook[]>('/books', { params: compactParams(filters) });
  if (!Array.isArray(data)) {
    throw new Error('The books API did not return a book list. Check VITE_API_URL or start the backend server.');
  }
  return data;
}

export async function getBook(id: string, lang: string) {
  const { data } = await api.get<PublicBook>(`/books/${id}`, { params: { lang } });
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error('The book API did not return a book. Check VITE_API_URL or start the backend server.');
  }
  return data;
}

export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post<{ token: string }>('/admin/auth/login', { email, password });
  return data;
}

export async function getAdminBooks() {
  const { data } = await api.get<AdminBook[]>('/admin/books');
  if (!Array.isArray(data)) {
    throw new Error('The admin books API did not return a book list. Check VITE_API_URL or start the backend server.');
  }
  return data;
}

function buildBookFormData(payload: BookPayload, coverImageFile: File | null) {
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

export async function createBook(payload: BookPayload, coverImageFile: File | null) {
  const { data } = await api.post<AdminBook>('/admin/books', buildBookFormData(payload, coverImageFile));
  return data;
}

export async function updateBook(id: string, payload: BookPayload, coverImageFile: File | null) {
  const { data } = await api.put<AdminBook>(`/admin/books/${id}`, buildBookFormData(payload, coverImageFile));
  return data;
}

export async function deleteBook(id: string) {
  const { data } = await api.delete<{ message: string }>(`/admin/books/${id}`);
  return data;
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  const { data } = await api.patch<AdminBook>(`/admin/books/${id}/availability`, { isAvailable });
  return data;
}

export async function getAdmins() {
  const { data } = await api.get<AdminAccount[]>('/admin/admins');
  if (!Array.isArray(data)) {
    throw new Error('The admins API did not return a list. Check VITE_API_URL or start the backend server.');
  }
  return data;
}

export async function createAdmin(payload: CreateAdminPayload) {
  const { data } = await api.post<AdminAccount>('/admin/admins', payload);
  return data;
}

export async function deleteAdmin(id: string) {
  const { data } = await api.delete<{ message: string }>(`/admin/admins/${id}`);
  return data;
}

export async function deactivateAdmin(id: string) {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/deactivate`);
  return data;
}

export async function reactivateAdmin(id: string) {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/reactivate`);
  return data;
}

export async function updateAdminRole(id: string, role: AdminRole) {
  const { data } = await api.patch<AdminAccount>(`/admin/admins/${id}/role`, { role });
  return data;
}

function compactParams(params: BookFilters) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}
