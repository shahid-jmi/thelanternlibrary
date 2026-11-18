import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '@/app/auth/AuthContext';
import { ThemeProvider } from '@/app/theme/ThemeContext';
import RequireAdmin from '@/app/auth/RequireAdmin';
import Shell from '@/app/components/Shell';
import ScrollToTop from '@/app/components/ScrollToTop';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import Loader from '@/app/components/Loader';
import HomePage from '@/app/pages/HomePage';
import CatalogPage from '@/app/pages/CatalogPage';
import CategoryPage from '@/app/pages/CategoryPage';
import BookDetailPage from '@/app/pages/BookDetailPage';
import CartPage from '@/app/pages/CartPage';
import CheckoutPage from '@/app/pages/CheckoutPage';
import { CartProvider } from '@/app/cart/CartContext';
import { CustomerProvider } from '@/app/auth/CustomerContext';
import RequireCustomer from '@/app/auth/RequireCustomer';
import ComingSoonPage from '@/app/pages/ComingSoonPage';
import { COMING_SOON } from '@/app/lib/site';

// Admin-only pages are lazy-loaded — a public visitor browsing the catalog
// should never have to download the admin dashboard/forms bundle.
const AdminLoginPage = lazy(() => import('@/app/pages/AdminLoginPage'));
const AdminForgotPasswordPage = lazy(() => import('@/app/pages/AdminForgotPasswordPage'));
const AdminResetPasswordPage = lazy(() => import('@/app/pages/AdminResetPasswordPage'));
const AdminChangePasswordPage = lazy(() => import('@/app/pages/AdminChangePasswordPage'));
const AdminDashboardPage = lazy(() => import('@/app/pages/AdminDashboardPage'));
const AdminManagementPage = lazy(() => import('@/app/pages/AdminManagementPage'));
const AdminCreateAdminPage = lazy(() => import('@/app/pages/AdminCreateAdminPage'));
const AdminBookFormPage = lazy(() => import('@/app/pages/AdminBookFormPage'));
const AdminProductFormPage = lazy(() => import('@/app/pages/AdminProductFormPage'));
const AdminCategoryFormPage = lazy(() => import('@/app/pages/AdminCategoryFormPage'));

const accountAuth = () => import('@/app/pages/account/AccountAuthPages');
const CustomerLoginPage = lazy(() => accountAuth().then((m) => ({ default: m.CustomerLoginPage })));
const CustomerRegisterPage = lazy(() =>
  accountAuth().then((m) => ({ default: m.CustomerRegisterPage }))
);
const CustomerForgotPasswordPage = lazy(() =>
  accountAuth().then((m) => ({ default: m.CustomerForgotPasswordPage }))
);
const CustomerResetPasswordPage = lazy(() =>
  accountAuth().then((m) => ({ default: m.CustomerResetPasswordPage }))
);
const VerifyEmailPage = lazy(() => accountAuth().then((m) => ({ default: m.VerifyEmailPage })));
const AccountPage = lazy(() => import('@/app/pages/account/AccountPage'));
const AccountOrderPage = lazy(() => import('@/app/pages/account/AccountOrderPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Client errors (4xx) will not succeed on retry.
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <CustomerProvider>
              <CartProvider>
                <Shell>
                  <ErrorBoundary>
                    <Suspense fallback={<Loader />}>
                      <Routes>
                        {COMING_SOON ? (
                          <Route path="/" element={<ComingSoonPage />} />
                        ) : (
                          <>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/catalog" element={<CatalogPage />} />
                            <Route path="/category/:slug" element={<CategoryPage />} />
                            <Route path="/book/:id" element={<BookDetailPage />} />
                            {/* Old single-book order links now go through the cart. */}
                            <Route
                              path="/book/:id/order"
                              element={<Navigate to="/cart" replace />}
                            />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/account/login" element={<CustomerLoginPage />} />
                            <Route path="/account/register" element={<CustomerRegisterPage />} />
                            <Route
                              path="/account/forgot-password"
                              element={<CustomerForgotPasswordPage />}
                            />
                            <Route
                              path="/account/reset-password"
                              element={<CustomerResetPasswordPage />}
                            />
                            <Route path="/account/verify-email" element={<VerifyEmailPage />} />
                            <Route element={<RequireCustomer />}>
                              <Route path="/account" element={<AccountPage />} />
                              <Route path="/account/orders/:id" element={<AccountOrderPage />} />
                            </Route>
                          </>
                        )}
                        <Route path="/admin" element={<AdminLoginPage />} />
                        <Route
                          path="/admin/forgot-password"
                          element={<AdminForgotPasswordPage />}
                        />
                        <Route path="/reset-password" element={<AdminResetPasswordPage />} />
                        <Route element={<RequireAdmin />}>
                          <Route
                            path="/admin/change-password"
                            element={<AdminChangePasswordPage />}
                          />
                          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                          <Route path="/admin/books/new" element={<AdminBookFormPage />} />
                          <Route path="/admin/books/:id/edit" element={<AdminBookFormPage />} />
                          <Route path="/admin/products/new" element={<AdminProductFormPage />} />
                          <Route
                            path="/admin/products/:id/edit"
                            element={<AdminProductFormPage />}
                          />
                          <Route path="/admin/categories/new" element={<AdminCategoryFormPage />} />
                          <Route
                            path="/admin/categories/:id/edit"
                            element={<AdminCategoryFormPage />}
                          />
                          <Route path="/admin/admins" element={<AdminManagementPage />} />
                          <Route path="/admin/admins/new" element={<AdminCreateAdminPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Shell>
              </CartProvider>
            </CustomerProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
