import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Plus, Shield, Trash2 } from 'lucide-react';
import { ADMIN_ROLES, type AdminAccount, type AdminRole } from '../api/types';
import { getErrorMessage } from '../api/client';
import {
  useAdmins,
  useDeleteAdmin,
  useSetAdminActive,
  useUpdateAdminRole,
} from '../queries/admins';
import { useAuth } from '../auth/AuthContext';
import { useConfirm } from '../lib/useConfirm';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import Loader from '../components/Loader';

export default function AdminManagementPage() {
  const { t } = useTranslation();
  const { admin: currentAdmin } = useAuth();
  const [actionError, setActionError] = useState('');
  const { confirm, dialog } = useConfirm();

  const adminsQuery = useAdmins();
  const deleteAdmin = useDeleteAdmin();
  const setAdminActive = useSetAdminActive();
  const updateAdminRole = useUpdateAdminRole();

  const admins = adminsQuery.data ?? [];
  const loadError = adminsQuery.isError ? getErrorMessage(adminsQuery.error) : '';
  const error = actionError || loadError;

  const removeAdmin = async (admin: AdminAccount) => {
    if (!(await confirm(`${t('admin.admins.delete')} ${admin.email}?`))) return;
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
          <Link
            to="/admin/admins/new"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('admin.admins.addAdmin')}
          </Link>
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
      {adminsQuery.isPending && <Loader label={t('admin.admins.loading')} />}

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

      {dialog}
    </PageFrame>
  );
}

export function RoleSelect({
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
      className="h-9 rounded-sm border border-border bg-input-background px-2 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25 disabled:opacity-50"
    >
      {ADMIN_ROLES.map((role) => (
        <option key={role} value={role}>
          {t(`admin.admins.role.${role}`)}
        </option>
      ))}
    </select>
  );
}
