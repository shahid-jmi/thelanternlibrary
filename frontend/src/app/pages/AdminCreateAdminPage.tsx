import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import type { AdminRole } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useCreateAdmin } from '../queries/admins';
import { validateConfirmPassword, validateEmail, validatePassword } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import { FieldInput } from '../components/FormField';
import { Button } from '../components/ui';
import { RoleSelect } from './AdminManagementPage';

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
      <Link
        to="/admin/admins"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.admins.backToList')}
      </Link>
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-6 w-6 text-[var(--icon-color)]" />
        <h1 className="text-3xl tracking-[0.05em]">{t('admin.admins.addAdmin')}</h1>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="max-w-xl rounded-sm border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="block text-sm">
            {t('admin.admins.role')}
            <div className="mt-1">
              <RoleSelect value={role} onChange={setRole} />
            </div>
          </label>
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
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-3">
          <Button disabled={createAdmin.isPending}>{t('admin.admins.save')}</Button>
          <Button type="button" variant="outline" onClick={goBack}>
            {t('admin.admins.cancel')}
          </Button>
        </div>
      </form>
    </PageFrame>
  );
}
