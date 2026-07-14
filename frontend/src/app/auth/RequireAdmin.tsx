import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export default function RequireAdmin() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
