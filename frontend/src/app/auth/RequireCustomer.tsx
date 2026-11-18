import { Navigate, Outlet, useLocation } from 'react-router';
import { useCustomer } from '@/app/auth/CustomerContext';
import PageFrame from '@/app/components/PageFrame';
import Loader from '@/app/components/Loader';

export default function RequireCustomer() {
  const { isSignedIn, isLoading } = useCustomer();
  const location = useLocation();

  if (isLoading) {
    return (
      <PageFrame compact>
        <Loader />
      </PageFrame>
    );
  }

  if (!isSignedIn) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/account/login?next=${next}`} replace />;
  }

  return <Outlet />;
}

/** Only allow redirects back into this site after signing in. */
export function safeNext(value: string | null, fallback = '/account'): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}
