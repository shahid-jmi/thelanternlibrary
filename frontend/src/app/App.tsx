import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '@/app/auth/AuthContext';
import { ThemeProvider } from '@/app/theme/ThemeContext';
import RequireAdmin from '@/app/auth/RequireAdmin';
import Shell from '@/app/components/Shell';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import Loader from '@/app/components/Loader';
import HomePage from '@/app/pages/HomePage';
import CatalogPage from '@/app/pages/CatalogPage';
import CategoryPage from '@/app/pages/CategoryPage';
import BookDetailPage from '@/app/pages/BookDetailPage';
import OrderPage from '@/app/pages/OrderPage';

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
          <AuthProvider>
            <Shell>
              <ErrorBoundary>
                <Suspense fallback={<Loader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/book/:id" element={<BookDetailPage />} />
                    <Route path="/book/:id/order" element={<OrderPage />} />
                    <Route path="/admin" element={<AdminLoginPage />} />
                    <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                    <Route path="/reset-password" element={<AdminResetPasswordPage />} />
                    <Route element={<RequireAdmin />}>
                      <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />
                      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                      <Route path="/admin/books/new" element={<AdminBookFormPage />} />
                      <Route path="/admin/books/:id/edit" element={<AdminBookFormPage />} />
                      <Route path="/admin/products/new" element={<AdminProductFormPage />} />
                      <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
                      <Route path="/admin/categories/new" element={<AdminCategoryFormPage />} />
                      <Route path="/admin/categories/:id/edit" element={<AdminCategoryFormPage />} />
                      <Route path="/admin/admins" element={<AdminManagementPage />} />
                      <Route path="/admin/admins/new" element={<AdminCreateAdminPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Shell>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
