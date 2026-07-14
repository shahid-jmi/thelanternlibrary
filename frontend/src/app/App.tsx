import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './auth/AuthContext';
import RequireAdmin from './auth/RequireAdmin';
import Shell from './components/Shell';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';

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
      <BrowserRouter>
        <AuthProvider>
          <Shell>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route element={<RequireAdmin />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/admins" element={<AdminManagementPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </Shell>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
