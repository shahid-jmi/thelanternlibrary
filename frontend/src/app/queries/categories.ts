import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  updateCategory,
} from '../api/categories';
import type { CategoryPayload } from '../api/types';
import { productKeys } from './products';

export const categoryKeys = {
  all: ['categories'] as const,
  public: (lang: string) => ['categories', 'public', lang] as const,
  admin: ['categories', 'admin'] as const,
};

export function useCategories(lang: string) {
  return useQuery({
    queryKey: categoryKeys.public(lang),
    queryFn: () => getCategories(lang),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.admin,
    queryFn: getAdminCategories,
  });
}

interface SaveCategoryInput {
  id?: string;
  payload: CategoryPayload;
}

export function useSaveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveCategoryInput) =>
      id ? updateCategory(id, payload) : createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Category names/active flags are embedded in product listings.
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
