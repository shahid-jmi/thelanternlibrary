import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { requestPasswordReset } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { validateEmail } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import Reveal from '../components/Reveal';
import StatusMessage from '../components/StatusMessage';
import { FieldInput } from '../components/FormField';

export default function AdminForgotPasswordPage() {
  const { t } = useTranslation();
  const email = useValidatedField(validateEmail);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (email.validateNow()) return;

    setError('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email.value);
      // Always show the same success state, whether or not the account
      // exists — the backend never reveals that either.
      setSubmitted(true);
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
            <h1 className="text-3xl tracking-[0.05em]">{t('admin.forgotPassword.title')}</h1>
          </div>

          <div className="my-6 flex items-center gap-3 opacity-40" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="h-1.5 w-1.5 rotate-45 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          {submitted ? (
            <StatusMessage>{t('admin.forgotPassword.success')}</StatusMessage>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="mb-5 text-sm opacity-75">{t('admin.forgotPassword.intro')}</p>
              <FieldInput
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                label={t('admin.forgotPassword.email')}
                value={email.value}
                onChange={email.onChange}
                onBlur={email.onBlur}
                error={email.error ? t(email.error) : undefined}
              />

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
                {t('admin.forgotPassword.submit')}
              </button>
            </form>
          )}

          <Link
            to="/admin"
            className="mt-6 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('admin.forgotPassword.backToLogin')}
          </Link>
        </div>
      </Reveal>
    </PageFrame>
  );
}
