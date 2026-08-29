import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Loader2, Shield } from 'lucide-react';
import { ADMIN_ROLES, type AdminRole } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useCreateAdmin } from '../queries/admins';
import { validateConfirmPassword, validateEmail, validatePassword } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import Reveal from '../components/Reveal';
import StatusMessage from '../components/StatusMessage';
import { FieldInput, FieldSelect } from '../components/FormField';

export default function AdminCreateAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createAdmin = useCreateAdmin();

  const email = useValidatedField(validateEmail);
  const password = useValidatedField(validatePassword);
  const confirmPassword = useValidatedField(validateConfirmPassword(password.value));
  const [role, setRole] = useState<AdminRole>('admin');
  const [error, setError] = useState('');

  const goBack = () => navigate('/admin/admins');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [email.validateNow(), password.validateNow(), confirmPassword.validateNow()];
    if (errors.some(Boolean)) return;

    setError('');
    try {
      await createAdmin.mutateAsync({ email: email.value, password: password.value, role });
      goBack();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <PageFrame compact>
      <Reveal className="mx-auto max-w-md">
        <div className="rounded-sm border border-border bg-card p-8 transition-shadow focus-within:shadow-[0_0_0_1px_var(--ember)]">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[var(--icon-color)]" />
            <h1 className="text-3xl tracking-[0.05em]">{t('admin.admins.addAdmin')}</h1>
          </div>

          <div className="my-6 flex items-center gap-3 opacity-40" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="h-1.5 w-1.5 rotate-45 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} noValidate>
            <FieldInput
              id="new-admin-email"
              type="email"
              autoComplete="email"
              label={t('admin.admins.email')}
              value={email.value}
              onChange={email.onChange}
              onBlur={email.onBlur}
              error={email.error ? t(email.error) : undefined}
            />

            <div className="mt-4">
              <FieldSelect
                id="new-admin-role"
                label={t('admin.admins.role')}
                value={role}
                onChange={(value) => setRole(value as AdminRole)}
              >
                {ADMIN_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {t(`admin.admins.role.${item}`)}
                  </option>
                ))}
              </FieldSelect>
            </div>

            <div className="mt-4">
              <FieldInput
                id="new-admin-password"
                type="password"
                autoComplete="new-password"
                label={t('admin.admins.password')}
                value={password.value}
                onChange={password.onChange}
                onBlur={password.onBlur}
                error={password.error ? t(password.error) : undefined}
              />
            </div>

            <div className="mt-4">
              <FieldInput
                id="new-admin-confirm-password"
                type="password"
                autoComplete="new-password"
                label={t('admin.admins.confirmPassword')}
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
                disabled={createAdmin.isPending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-ember text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {createAdmin.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('admin.admins.save')}
              </button>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm"
              >
                {t('admin.admins.cancel')}
              </button>
            </div>
          </form>
        </div>
      </Reveal>
    </PageFrame>
  );
}
