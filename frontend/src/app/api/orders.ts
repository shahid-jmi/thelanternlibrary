import { api } from '@/app/api/client';
import type {
  AdminDashboard,
  AdminOrder,
  AdminOrderPage,
  CreateOrderPayload,
  OrderFilters,
  OrderLineInput,
  OrderQuote,
  OrderStatusUpdate,
  OrderView,
  PaymentUpdate,
  PublicOrder,
  PublicSettings,
} from '@/app/api/types';

function compactParams(params: OrderFilters) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
}

export async function createOrder(payload: CreateOrderPayload): Promise<PublicOrder> {
  const { data } = await api.post<PublicOrder>('/orders', payload);
  return data;
}

export async function getAdminOrders(filters: OrderFilters): Promise<AdminOrderPage> {
  const { data } = await api.get<AdminOrderPage>('/admin/orders', {
    params: compactParams(filters),
  });
  if (!data || !Array.isArray(data.orders)) {
    throw new Error(
      'The orders API did not return an order list. Check VITE_API_URL or start the backend server.'
    );
  }
  return data;
}

export async function getOrderViewCounts(): Promise<Record<OrderView, number>> {
  const { data } = await api.get<Record<OrderView, number>>('/admin/orders/counts');
  return data;
}

export async function updateOrderStatus(id: string, body: OrderStatusUpdate): Promise<AdminOrder> {
  const { data } = await api.patch<AdminOrder>(`/admin/orders/${id}/status`, body);
  return data;
}

export async function updatePayment(id: string, body: PaymentUpdate): Promise<AdminOrder> {
  const { data } = await api.patch<AdminOrder>(`/admin/orders/${id}/payment`, body);
  return data;
}

export async function updateDeliveryCharge(
  id: string,
  deliveryCharge: number
): Promise<AdminOrder> {
  const { data } = await api.patch<AdminOrder>(`/admin/orders/${id}/delivery-charge`, {
    deliveryCharge,
  });
  return data;
}

export async function resolveAttention(
  id: string,
  body: { skipStock?: boolean; note?: string }
): Promise<AdminOrder> {
  const { data } = await api.post<AdminOrder>(`/admin/orders/${id}/resolve`, body);
  return data;
}

export async function downloadReceipt(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/admin/orders/${id}/receipt`, { responseType: 'blob' });
  return data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await api.get<AdminDashboard>('/admin/dashboard');
  return data;
}

export async function quoteOrder(items: OrderLineInput[], state?: string): Promise<OrderQuote> {
  const { data } = await api.post<OrderQuote>('/orders/quote', {
    items,
    state: state || undefined,
  });
  return data;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await api.get<PublicSettings>('/settings');
  return data;
}
