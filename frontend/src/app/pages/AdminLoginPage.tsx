import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import PageFrame from '../components/PageFrame';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError) || t('admin.login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame compact>
      <form
        onSubmit={submit}
        className="mx-auto max-w-md rounded-sm border border-border bg-card p-8"
      >
        <div className="mb-8 flex items-center gap-3">
          <Lock className="h-5 w-5 text-[var(--icon-color)]" />
          <h1 className="text-3xl tracking-[0.05em]">{t('admin.login.title')}</h1>
        </div>
        <label className="mb-2 block text-sm">{t('admin.login.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
          required
        />
        <label className="mb-2 block text-sm">{t('admin.login.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
          required
        />
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <button
          disabled={submitting}
          className="h-11 w-full rounded-sm bg-primary px-5 text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {t('admin.login.submit')}
        </button>
      </form>
    </PageFrame>
  );
}
