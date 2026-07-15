import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProduct,
  getProducts,
  toggleProductAvailability,
  updateProduct,
} from '../api/products';
import type { ProductFilters, ProductPayload } from '../api/types';

export const productKeys = {
  all: ['products'] as const,
  public: (filters: ProductFilters) => ['products', 'public', filters] as const,
  detail: (id: string, lang: string) => ['products', 'detail', id, lang] as const,
  admin: ['products', 'admin'] as const,
};

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.public(filters),
    queryFn: () => getProducts(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined, lang: string) {
  return useQuery({
    queryKey: productKeys.detail(id ?? '', lang),
    queryFn: () => getProduct(id!, lang),
    enabled: Boolean(id),
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.admin,
    queryFn: getAdminProducts,
  });
}

interface SaveProductInput {
  id?: string;
  payload: ProductPayload;
  coverImageFile: File | null;
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, coverImageFile }: SaveProductInput) =>
      id ? updateProduct(id, payload, coverImageFile) : createProduct(payload, coverImageFile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useToggleProductAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      toggleProductAvailability(id, isAvailable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
