import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, downloadInvoice, getAdminOrders, updateOrderStatus } from '../api/orders';
import type { CreateOrderPayload, OrderFilters, OrderStatus } from '../api/types';

export const orderKeys = {
  all: ['orders'] as const,
  admin: (filters: OrderFilters) => ['orders', 'admin', filters] as const,
};

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
  });
}

export function useAdminOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.admin(filters),
    queryFn: () => getAdminOrders(filters),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      deliveryCharge,
    }: {
      id: string;
      status: OrderStatus;
      deliveryCharge?: number;
    }) => updateOrderStatus(id, status, deliveryCharge),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => downloadInvoice(id),
  });
}
