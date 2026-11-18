import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setCustomerUnauthorizedHandler } from '@/app/api/client';
import { getMe, loginCustomer, registerCustomer } from '@/app/api/customer';
import type { Customer, CustomerSession } from '@/app/api/types';
import { clearCustomerToken, getCustomerToken, setCustomerToken } from '@/app/auth/customerStorage';

export const customerKeys = {
  all: ['customer'] as const,
  me: ['customer', 'me'] as const,
  orders: (page: number) => ['customer', 'orders', page] as const,
  order: (id: string) => ['customer', 'order', id] as const,
};

interface CustomerContextValue {
  customer: Customer | null;
  isSignedIn: boolean;
  /** True while a stored session is being checked on page load. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Customer>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => Promise<Customer>;
  logout: () => void;
  /** Store a fresh session (after a password change) or updated profile. */
  applySession: (session: CustomerSession) => void;
  setCustomer: (customer: Customer) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(getCustomerToken()));

  const meQuery = useQuery({
    queryKey: customerKeys.me,
    queryFn: getMe,
    enabled: hasToken,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    setCustomerUnauthorizedHandler(() => {
      setHasToken(false);
      queryClient.removeQueries({ queryKey: customerKeys.all });
    });
    return () => setCustomerUnauthorizedHandler(null);
  }, [queryClient]);

  const value = useMemo<CustomerContextValue>(() => {
    const applySession = (session: CustomerSession) => {
      setCustomerToken(session.token);
      setHasToken(true);
      queryClient.setQueryData(customerKeys.me, session.customer);
    };
    const customer = hasToken ? (meQuery.data ?? null) : null;

    return {
      customer,
      isSignedIn: customer !== null,
      isLoading: hasToken && meQuery.isPending,
      async login(email, password) {
        const session = await loginCustomer(email, password);
        applySession(session);
        return session.customer;
      },
      async register(payload) {
        const session = await registerCustomer(payload);
        applySession(session);
        return session.customer;
      },
      logout() {
        clearCustomerToken();
        setHasToken(false);
        queryClient.removeQueries({ queryKey: customerKeys.all });
      },
      applySession,
      setCustomer(next) {
        queryClient.setQueryData(customerKeys.me, next);
      },
    };
  }, [hasToken, meQuery.data, meQuery.isPending, queryClient]);

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerContextValue {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomer must be used inside <CustomerProvider>');
  return context;
}
