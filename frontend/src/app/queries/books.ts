import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBook,
  deleteBook,
  getAdminBooks,
  getBook,
  getBooks,
  toggleAvailability,
  updateBook,
} from '../api/books';
import type { BookFilters, BookPayload } from '../api/types';

export const bookKeys = {
  all: ['books'] as const,
  public: (filters: BookFilters) => ['books', 'public', filters] as const,
  detail: (id: string, lang: string) => ['books', 'detail', id, lang] as const,
  admin: ['books', 'admin'] as const,
};

export function useBooks(filters: BookFilters) {
  return useQuery({
    queryKey: bookKeys.public(filters),
    queryFn: () => getBooks(filters),
    placeholderData: keepPreviousData,
  });
}

export function useBook(id: string | undefined, lang: string) {
  return useQuery({
    queryKey: bookKeys.detail(id ?? '', lang),
    queryFn: () => getBook(id!, lang),
    enabled: Boolean(id),
  });
}

export function useAdminBooks() {
  return useQuery({
    queryKey: bookKeys.admin,
    queryFn: getAdminBooks,
  });
}

interface SaveBookInput {
  id?: string;
  payload: BookPayload;
  coverImageFile: File | null;
}

export function useSaveBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, coverImageFile }: SaveBookInput) =>
      id ? updateBook(id, payload, coverImageFile) : createBook(payload, coverImageFile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  });
}

export function useToggleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      toggleAvailability(id, isAvailable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  });
}
