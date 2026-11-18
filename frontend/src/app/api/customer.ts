import { api } from '@/app/api/client';
import type {
  AdminCustomerPage,
  AdminCustomerSummary,
  AdminOrder,
  Customer,
  CustomerAddressInput,
  CustomerOrder,
  CustomerOrderPage,
  CustomerSession,
} from '@/app/api/types';

export async function registerCustomer(payload: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<CustomerSession> {
  const { data } = await api.post<CustomerSession>('/customer/register', payload);
  return data;
}

export async function loginCustomer(email: string, password: string): Promise<CustomerSession> {
  const { data } = await api.post<CustomerSession>('/customer/login', { email, password });
  return data;
}

export async function getMe(): Promise<Customer> {
  const { data } = await api.get<Customer>('/customer/me');
  return data;
}

export async function updateProfile(payload: { name: string; phone: string }): Promise<Customer> {
  const { data } = await api.patch<Customer>('/customer/me', payload);
  return data;
}

export async function verifyEmail(token: string): Promise<Customer> {
  const { data } = await api.post<Customer>('/customer/verify-email', { token });
  return data;
}

export async function resendVerification(): Promise<void> {
  await api.post('/customer/resend-verification');
}

export async function requestCustomerPasswordReset(email: string): Promise<void> {
  await api.post('/customer/forgot-password', { email });
}

export async function resetCustomerPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/customer/reset-password', { token, newPassword });
}

export async function changeCustomerPassword(
  currentPassword: string,
  newPassword: string
): Promise<CustomerSession> {
  const { data } = await api.post<CustomerSession>('/customer/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function addAddress(payload: CustomerAddressInput): Promise<Customer> {
  const { data } = await api.post<Customer>('/customer/addresses', payload);
  return data;
}

export async function updateAddress(id: string, payload: CustomerAddressInput): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customer/addresses/${id}`, payload);
  return data;
}

export async function deleteAddress(id: string): Promise<Customer> {
  const { data } = await api.delete<Customer>(`/customer/addresses/${id}`);
  return data;
}

export async function getMyOrders(page: number): Promise<CustomerOrderPage> {
  const { data } = await api.get<CustomerOrderPage>('/customer/orders', { params: { page } });
  return data;
}

export async function getMyOrder(id: string): Promise<CustomerOrder> {
  const { data } = await api.get<CustomerOrder>(`/customer/orders/${id}`);
  return data;
}

export async function downloadMyReceipt(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/customer/orders/${id}/receipt`, {
    responseType: 'blob',
  });
  return data;
}

export async function getAdminCustomers(params: {
  search?: string;
  page: number;
}): Promise<AdminCustomerPage> {
  const { data } = await api.get<AdminCustomerPage>('/admin/customers', {
    params: Object.fromEntries(Object.entries(params).filter(([, value]) => value)),
  });
  return data;
}

export async function getAdminCustomer(
  id: string
): Promise<AdminCustomerSummary & { orders: AdminOrder[] }> {
  const { data } = await api.get<AdminCustomerSummary & { orders: AdminOrder[] }>(
    `/admin/customers/${id}`
  );
  return data;
}
