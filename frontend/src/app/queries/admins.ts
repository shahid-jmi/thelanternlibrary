import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdmin,
  deactivateAdmin,
  deleteAdmin,
  getAdmins,
  reactivateAdmin,
  updateAdminRole,
} from '../api/admins';
import type { AdminRole, CreateAdminPayload } from '../api/types';

export const adminKeys = {
  all: ['admins'] as const,
};

export function useAdmins() {
  return useQuery({
    queryKey: adminKeys.all,
    queryFn: getAdmins,
  });
}

function useInvalidateAdmins() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminKeys.all });
}

export function useCreateAdmin() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdmin(payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAdmin() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: invalidate,
  });
}

export function useSetAdminActive() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? reactivateAdmin(id) : deactivateAdmin(id),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminRole() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRole }) => updateAdminRole(id, role),
    onSuccess: invalidate,
  });
}
