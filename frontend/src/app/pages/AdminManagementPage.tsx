import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Plus, Shield, Trash2 } from 'lucide-react';
import {
  ADMIN_ROLES,
  type AdminAccount,
  type AdminRole,
  type CreateAdminPayload,
} from '../api/types';
import { getErrorMessage } from '../api/client';
import {
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  useSetAdminActive,
  useUpdateAdminRole,
} from '../queries/admins';
import { useAuth } from '../auth/AuthContext';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import { TextInput } from '../components/FormControls';

export default function AdminManagementPage() {
  const { t } = useTranslation();
  const { admin: currentAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');

  const adminsQuery = useAdmins();
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const setAdminActive = useSetAdminActive();
  const updateAdminRole = useUpdateAdminRole();

  const admins = adminsQuery.data ?? [];
  const loadError = adminsQuery.isError ? getErrorMessage(adminsQuery.error) : '';
  const error = actionError || loadError;

  const addAdmin = async (payload: CreateAdminPayload) => {
    await createAdmin.mutateAsync(payload);
    setShowForm(false);
  };

  const removeAdmin = async (admin: AdminAccount) => {
    if (!window.confirm(`${t('admin.admins.delete')} ${admin.email}?`)) return;
    try {
      await deleteAdmin.mutateAsync(admin._id);
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const toggleActive = async (admin: AdminAccount) => {
    try {
      await setAdminActive.mutateAsync({ id: admin._id, isActive: !admin.isActive });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const changeRole = async (admin: AdminAccount, role: AdminRole) => {
    if (role === admin.role) return;
    try {
      await updateAdminRole.mutateAsync({ id: admin._id, role });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  return (
    <PageFrame>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[var(--icon-color)]" />
          <h1 className="text-4xl tracking-[0.05em]">{t('admin.admins.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            {t('admin.admins.addAdmin')}
          </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('admin.admins.backToDashboard')}
          </Link>
        </div>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {adminsQuery.isPending && <StatusMessage>{t('admin.admins.loading')}</StatusMessage>}

      {showForm && <AdminForm onCancel={() => setShowForm(false)} onSave={addAdmin} />}

      <div className="overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm rtl:text-right">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-4 py-3">{t('admin.admins.email')}</th>
              <th className="px-4 py-3">{t('admin.admins.role')}</th>
              <th className="px-4 py-3">{t('admin.admins.status')}</th>
              <th className="px-4 py-3">{t('admin.admins.lastLogin')}</th>
              <th className="px-4 py-3">{t('admin.admins.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin._id === currentAdmin?.sub;
              return (
                <tr key={admin._id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    {admin.email}
                    {isSelf && (
                      <span className="ml-2 text-xs opacity-60 rtl:ml-0 rtl:mr-2">
                        ({t('admin.admins.you')})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect
                      value={admin.role}
                      disabled={isSelf}
                      onChange={(role) => changeRole(admin, role)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(admin)}
                      disabled={isSelf}
                      className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 disabled:opacity-50"
                    >
                      {admin.isActive && <Check className="h-3.5 w-3.5" />}
                      {admin.isActive ? t('admin.admins.active') : t('admin.admins.inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleString()
                      : t('admin.admins.never')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeAdmin(admin)}
                      disabled={isSelf}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.admins.delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageFrame>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: AdminRole;
  onChange: (role: AdminRole) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as AdminRole)}
      className="h-9 rounded-sm border border-border bg-input-background px-2 text-sm outline-none focus:border-ring disabled:opacity-50"
    >
      {ADMIN_ROLES.map((role) => (
        <option key={role} value={role}>
          {t(`admin.admins.role.${role}`)}
        </option>
      ))}
    </select>
  );
}

function AdminForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (payload: CreateAdminPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ email, password, role });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label={t('admin.admins.email')} value={email} onChange={setEmail} required />
        <label className="block text-sm">
          {t('admin.admins.password')}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
            required
            minLength={8}
          />
        </label>
        <label className="block text-sm">
          {t('admin.admins.role')}
          <div className="mt-1">
            <RoleSelect value={role} onChange={setRole} />
          </div>
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button
          disabled={saving}
          className="h-10 rounded-sm bg-primary px-5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {t('admin.admins.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-sm border border-border px-5 text-sm"
        >
          {t('admin.admins.cancel')}
        </button>
      </div>
    </form>
  );
}
