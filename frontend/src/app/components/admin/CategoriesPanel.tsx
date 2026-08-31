import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import type { AdminCategory } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useAdminCategories, useDeleteCategory } from '@/app/queries/categories';
import { useAuth } from '@/app/auth/AuthContext';
import { useConfirm } from '@/app/lib/useConfirm';
import { useConfirmedDelete } from '@/app/lib/useConfirmedDelete';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';

export default function CategoriesPanel() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { confirm, dialog } = useConfirm();

  const categoriesQuery = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesQuery.data ?? [];
  const loadError = categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '';
  const error = actionError || loadError;

  const query = debouncedSearch.trim().toLowerCase();
  const filteredCategories = query
    ? categories.filter(
        (category) =>
          category.name.en.toLowerCase().includes(query) ||
          category.name.ur?.toLowerCase().includes(query)
      )
    : categories;

  const confirmedDelete = useConfirmedDelete(deleteCategory, confirm, setActionError);
  const removeCategory = (category: AdminCategory) =>
    confirmedDelete(category._id, `${t('admin.dashboard.delete')} "${category.name.en}"?`);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.dashboard.searchCategories')}
            className="h-11 w-full min-w-64 rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
          />
        </div>
        {isSuperAdmin && (
          <Link
            to="/admin/categories/new"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-5 text-sm text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('admin.dashboard.addCategory')}
          </Link>
        )}
      </div>
      <p className="mb-6 text-sm italic opacity-70">
        {isSuperAdmin ? t('admin.categories.hint') : t('admin.categories.readOnly')}
      </p>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {categoriesQuery.isPending && <Loader label="Loading categories..." />}
      {!categoriesQuery.isPending && categories.length > 0 && filteredCategories.length === 0 && (
        <StatusMessage>{t('admin.dashboard.noResults')}</StatusMessage>
      )}

      <Table>
        <TableHead>
          <tr>
            <Th>Name</Th>
            <Th>{t('admin.form.slug')}</Th>
            <Th>{t('admin.form.tagline')}</Th>
            <Th>{t('admin.admins.status')}</Th>
            {isSuperAdmin && <Th>{t('admin.admins.actions')}</Th>}
          </tr>
        </TableHead>
        <tbody>
          {filteredCategories.map((category) => (
            <TableRow key={category._id}>
              <Td>{category.name.en}</Td>
              <Td className="font-mono text-xs">{category.slug}</Td>
              <Td className="max-w-xs truncate italic opacity-75">
                {category.tagline?.en || '—'}
              </Td>
              <Td>
                <Badge active={category.isActive}>
                  {category.isActive ? t('admin.admins.active') : t('admin.admins.inactive')}
                </Badge>
              </Td>
              {isSuperAdmin && (
                <Td>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/categories/${category._id}/edit`}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm transition hover:bg-secondary"
                    >
                      <Edit className="h-4 w-4" />
                      {t('admin.dashboard.edit')}
                    </Link>
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      onClick={() => removeCategory(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.dashboard.delete')}
                    </Button>
                  </div>
                </Td>
              )}
            </TableRow>
          ))}
        </tbody>
      </Table>

      {dialog}
    </section>
  );
}
