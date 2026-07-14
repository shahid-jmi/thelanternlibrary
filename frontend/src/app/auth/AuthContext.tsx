import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { setUnauthorizedHandler } from '../api/client';
import { loginAdmin } from '../api/auth';
import {
  clearToken,
  decodeAdminToken,
  getCurrentAdmin,
  setToken,
  type AdminTokenClaims,
} from './authStorage';

interface AuthContextValue {
  admin: AdminTokenClaims | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminTokenClaims | null>(getCurrentAdmin);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAdmin(null);
      navigate('/admin', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isAuthenticated: admin !== null,
      isSuperAdmin: admin?.role === 'super_admin',
      async login(email: string, password: string) {
        const { token } = await loginAdmin(email, password);
        setToken(token);
        setAdmin(decodeAdminToken(token));
      },
      logout() {
        clearToken();
        setAdmin(null);
        navigate('/admin', { replace: true });
      },
    }),
    [admin, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
