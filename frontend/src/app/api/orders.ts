import { api } from './client';
import type {
  AdminOrder,
  CreateOrderPayload,
  OrderFilters,
  OrderStatus,
  PublicOrder,
} from './types';

function compactParams(params: OrderFilters) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
}

export async function createOrder(payload: CreateOrderPayload): Promise<PublicOrder> {
  const { data } = await api.post<PublicOrder>('/orders', payload);
  return data;
}

export async function getAdminOrders(filters: OrderFilters): Promise<AdminOrder[]> {
  const { data } = await api.get<AdminOrder[]>('/admin/orders', {
    params: compactParams(filters),
  });
  if (!Array.isArray(data)) {
    throw new Error(
      'The orders API did not return an order list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  deliveryCharge?: number
): Promise<AdminOrder> {
  const { data } = await api.patch<AdminOrder>(`/admin/orders/${id}/status`, {
    status,
    deliveryCharge,
  });
  return data;
}

export async function downloadInvoice(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/admin/orders/${id}/invoice`, { responseType: 'blob' });
  return data;
}
