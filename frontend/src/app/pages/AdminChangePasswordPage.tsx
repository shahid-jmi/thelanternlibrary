import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2 } from 'lucide-react';
import { changePassword } from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/client';
import { useAuth } from '@/app/auth/AuthContext';
import { validateConfirmPassword, validatePassword, validateRequired } from '@/app/lib/validation';
import { useValidatedField } from '@/app/lib/useValidatedField';
import PageFrame from '@/app/components/PageFrame';
import Reveal from '@/app/components/Reveal';
import StatusMessage from '@/app/components/StatusMessage';
import { FieldInput } from '@/app/components/FormField';

export default function AdminChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mustChangePassword, completePasswordChange } = useAuth();

  const currentPassword = useValidatedField(validateRequired);
  const newPassword = useValidatedField(validatePassword);
  const confirmPassword = useValidatedField(validateConfirmPassword(newPassword.value));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [
      currentPassword.validateNow(),
      newPassword.validateNow(),
      confirmPassword.validateNow(),
    ];
    if (errors.some(Boolean)) return;

    setError('');
    setSubmitting(true);
    try {
      await changePassword(currentPassword.value, newPassword.value);
      completePasswordChange();
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
        <div className="rounded-sm border border-border bg-card p-8 transition-shadow focus-within:shadow-[0_0_0_1px_var(--ember)]">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-[var(--icon-color)]" />
            <h1 className="text-3xl tracking-[0.05em]">{t('admin.changePassword.title')}</h1>
          </div>

          <div className="my-6 flex items-center gap-3 opacity-40" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="h-1.5 w-1.5 rotate-45 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          {mustChangePassword && (
            <div className="mb-5">
              <StatusMessage>{t('admin.changePassword.forcedNotice')}</StatusMessage>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <FieldInput
              id="change-password-current"
              type="password"
              autoComplete="current-password"
              label={t('admin.changePassword.currentPassword')}
              value={currentPassword.value}
              onChange={currentPassword.onChange}
              onBlur={currentPassword.onBlur}
              error={currentPassword.error ? t(currentPassword.error) : undefined}
            />

            <div className="mt-4">
              <FieldInput
                id="change-password-new"
                type="password"
                autoComplete="new-password"
                label={t('admin.changePassword.newPassword')}
                value={newPassword.value}
                onChange={newPassword.onChange}
                onBlur={newPassword.onBlur}
                error={newPassword.error ? t(newPassword.error) : undefined}
              />
            </div>

            <div className="mt-4">
              <FieldInput
                id="change-password-confirm"
                type="password"
                autoComplete="new-password"
                label={t('admin.changePassword.confirmPassword')}
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

            <div className="mt-5 flex gap-3">
              <button
                disabled={submitting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-ember text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('admin.changePassword.submit')}
              </button>
              {!mustChangePassword && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm"
                >
                  {t('admin.form.cancel')}
                </Link>
              )}
            </div>
          </form>
        </div>
      </Reveal>
    </PageFrame>
  );
}
