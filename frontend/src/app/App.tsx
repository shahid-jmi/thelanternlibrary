import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import RequireAdmin from './auth/RequireAdmin';
import Shell from './components/Shell';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import OrderPage from './pages/OrderPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import AdminChangePasswordPage from './pages/AdminChangePasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';
import AdminCreateAdminPage from './pages/AdminCreateAdminPage';
import AdminBookFormPage from './pages/AdminBookFormPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminCategoryFormPage from './pages/AdminCategoryFormPage';

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
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
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
              </ErrorBoundary>
            </Shell>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
