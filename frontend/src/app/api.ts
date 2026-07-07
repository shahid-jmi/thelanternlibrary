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
export const TRANSLATION_LANGUAGES = ['en', 'ur', 'fa'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookLanguage = (typeof BOOK_LANGUAGES)[number];
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

export interface PublicBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  coverImage?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBook extends Omit<PublicBook, 'title' | 'description'> {
  title: {
    en: string;
    ur?: string;
    fa?: string;
  };
  description: {
    en: string;
    ur?: string;
    fa?: string;
  };
}

export interface BookPayload {
  title: {
    en: string;
    ur?: string;
    fa?: string;
  };
  description: {
    en: string;
    ur?: string;
    fa?: string;
  };
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  coverImage?: string;
  isAvailable: boolean;
}

export interface BookFilters {
  lang?: string;
  search?: string;
  genre?: string;
  language?: string;
  available?: string;
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

export async function loginAdmin(password: string) {
  const { data } = await api.post<{ token: string }>('/admin/auth/login', { password });
  return data;
}

export async function getAdminBooks() {
  const { data } = await api.get<AdminBook[]>('/admin/books');
  if (!Array.isArray(data)) {
    throw new Error('The admin books API did not return a book list. Check VITE_API_URL or start the backend server.');
  }
  return data;
}

export async function createBook(payload: BookPayload) {
  const { data } = await api.post<AdminBook>('/admin/books', payload);
  return data;
}

export async function updateBook(id: string, payload: BookPayload) {
  const { data } = await api.put<AdminBook>(`/admin/books/${id}`, payload);
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

function compactParams(params: BookFilters) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}
