import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import PageFrame from '../components/PageFrame';
import Reveal from '../components/Reveal';
import StatusMessage from '../components/StatusMessage';
import { FieldInput } from '../components/FormField';
import { validateEmail, validatePassword } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const email = useValidatedField(validateEmail);
  const password = useValidatedField(validatePassword);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const emailError = email.validateNow();
    const passwordError = password.validateNow();
    if (emailError || passwordError) return;

    setSubmitting(true);
    try {
      await login(email.value, password.value);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError) || t('admin.login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame compact>
      <Reveal className="mx-auto max-w-md">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-sm border border-border bg-card p-8 transition-shadow focus-within:shadow-[0_0_0_1px_var(--ember)]"
        >
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[var(--icon-color)]" />
            <h1 className="text-3xl tracking-[0.05em]">{t('admin.login.title')}</h1>
          </div>

          <div className="my-6 flex items-center gap-3 opacity-40" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="h-1.5 w-1.5 rotate-45 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          <FieldInput
            id="admin-email"
            type="email"
            autoComplete="email"
            label={t('admin.login.email')}
            value={email.value}
            onChange={email.onChange}
            onBlur={email.onBlur}
            error={email.error ? t(email.error) : undefined}
          />

          <div className="mt-3">
            <FieldInput
              id="admin-password"
              type="password"
              autoComplete="current-password"
              label={t('admin.login.password')}
              value={password.value}
              onChange={password.onChange}
              onBlur={password.onBlur}
              error={password.error ? t(password.error) : undefined}
            />
          </div>

          {error && (
            <div className="mt-4">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          )}

          <button
            disabled={submitting}
            className="mt-2 h-11 w-full rounded-sm bg-ember text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {t('admin.login.submit')}
          </button>
        </form>
      </Reveal>
    </PageFrame>
  );
}
