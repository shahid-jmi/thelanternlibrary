import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext';

export default function RequireAdmin() {
  const { isAuthenticated, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (mustChangePassword && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
}
