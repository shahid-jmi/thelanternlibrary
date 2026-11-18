import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  downloadReceipt,
  getAdminDashboard,
  getAdminOrders,
  getOrderViewCounts,
  getPublicSettings,
  quoteOrder,
  resolveAttention,
  updateDeliveryCharge,
  updateOrderStatus,
  updatePayment,
} from '@/app/api/orders';
import type {
  CreateOrderPayload,
  OrderLineInput,
  OrderFilters,
  OrderStatusUpdate,
  PaymentUpdate,
} from '@/app/api/types';

export const orderKeys = {
  all: ['orders'] as const,
  admin: (filters: OrderFilters) => ['orders', 'admin', filters] as const,
  counts: ['orders', 'counts'] as const,
  dashboard: ['orders', 'dashboard'] as const,
};

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
  });
}

// Re-priced by the server whenever the cart or delivery state changes.
export function useOrderQuote(items: OrderLineInput[], state?: string) {
  return useQuery({
    queryKey: ['orders', 'quote', items, state ?? ''] as const,
    queryFn: () => quoteOrder(items, state),
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function usePublicSettings() {
  return useQuery({ queryKey: ['settings', 'public'] as const, queryFn: getPublicSettings });
}

export function useAdminOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.admin(filters),
    queryFn: () => getAdminOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrderViewCounts() {
  return useQuery({ queryKey: orderKeys.counts, queryFn: getOrderViewCounts });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: orderKeys.dashboard, queryFn: getAdminDashboard });
}

// Every order action can change counts, stock and the dashboard, so refresh
// everything order-related (and the catalog, whose stock may have moved).
function useOrderMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrderStatus() {
  return useOrderMutation(({ id, ...body }: { id: string } & OrderStatusUpdate) =>
    updateOrderStatus(id, body)
  );
}

export function useUpdatePayment() {
  return useOrderMutation(({ id, ...body }: { id: string } & PaymentUpdate) =>
    updatePayment(id, body)
  );
}

export function useUpdateDeliveryCharge() {
  return useOrderMutation(({ id, deliveryCharge }: { id: string; deliveryCharge: number }) =>
    updateDeliveryCharge(id, deliveryCharge)
  );
}

export function useResolveAttention() {
  return useOrderMutation(({ id, ...body }: { id: string; skipStock?: boolean; note?: string }) =>
    resolveAttention(id, body)
  );
}

export function useDownloadReceipt() {
  return useMutation({ mutationFn: (id: string) => downloadReceipt(id) });
}
