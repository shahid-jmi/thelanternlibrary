import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { setUnauthorizedHandler } from '@/app/api/client';
import { loginAdmin } from '@/app/api/auth';
import {
  clearToken,
  decodeAdminToken,
  getCurrentAdmin,
  getMustChangePassword,
  setMustChangePassword,
  setToken,
  type AdminTokenClaims,
} from '@/app/auth/authStorage';

interface AuthContextValue {
  admin: AdminTokenClaims | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completePasswordChange: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminTokenClaims | null>(getCurrentAdmin);
  const [mustChangePassword, setMustChangePasswordState] = useState(getMustChangePassword);

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
      mustChangePassword,
      async login(email: string, password: string) {
        const result = await loginAdmin(email, password);
        setToken(result.token);
        setMustChangePassword(result.mustChangePassword);
        setAdmin(decodeAdminToken(result.token));
        setMustChangePasswordState(result.mustChangePassword);
      },
      logout() {
        clearToken();
        setAdmin(null);
        setMustChangePasswordState(false);
        navigate('/admin', { replace: true });
      },
      completePasswordChange() {
        setMustChangePassword(false);
        setMustChangePasswordState(false);
      },
    }),
    [admin, mustChangePassword, navigate]
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
