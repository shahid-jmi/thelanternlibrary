import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2 } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { validateConfirmPassword, validatePassword } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import Reveal from '../components/Reveal';
import StatusMessage from '../components/StatusMessage';
import { FieldInput } from '../components/FormField';

export default function AdminResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const newPassword = useValidatedField(validatePassword);
  const confirmPassword = useValidatedField(validateConfirmPassword(newPassword.value));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const errors = [newPassword.validateNow(), confirmPassword.validateNow()];
    if (errors.some(Boolean)) return;

    setError('');
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword.value);
      setSubmitted(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError) || t('admin.resetPassword.expiredOrInvalid'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame compact>
      <Reveal className="mx-auto max-w-md">
        <div className="rounded-sm border border-border bg-card p-8 transition-shadow focus-within:shadow-[0_0_0_1px_var(--ember)]">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-[var(--icon-color)]" />
            <h1 className="text-3xl tracking-[0.05em]">{t('admin.resetPassword.title')}</h1>
          </div>

          <div className="my-6 flex items-center gap-3 opacity-40" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="h-1.5 w-1.5 rotate-45 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          {!token ? (
            <>
              <StatusMessage tone="error">{t('admin.resetPassword.invalidLink')}</StatusMessage>
              <Link
                to="/admin/forgot-password"
                className="mt-6 inline-block text-sm text-ember transition hover:opacity-80"
              >
                {t('admin.resetPassword.requestNewLink')}
              </Link>
            </>
          ) : submitted ? (
            <>
              <StatusMessage>{t('admin.resetPassword.success')}</StatusMessage>
              <Link
                to="/admin"
                className="mt-6 inline-block text-sm text-ember transition hover:opacity-80"
              >
                {t('admin.resetPassword.goToLogin')}
              </Link>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <FieldInput
                id="reset-password-new"
                type="password"
                autoComplete="new-password"
                label={t('admin.resetPassword.newPassword')}
                value={newPassword.value}
                onChange={newPassword.onChange}
                onBlur={newPassword.onBlur}
                error={newPassword.error ? t(newPassword.error) : undefined}
              />

              <div className="mt-4">
                <FieldInput
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  label={t('admin.resetPassword.confirmPassword')}
                  value={confirmPassword.value}
                  onChange={confirmPassword.onChange}
                  onBlur={confirmPassword.onBlur}
                  error={confirmPassword.error ? t(confirmPassword.error) : undefined}
                />
              </div>

              {error && (
                <div className="mt-4">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              )}

              <button
                disabled={submitting}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ember text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('admin.resetPassword.submit')}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </PageFrame>
  );
}
