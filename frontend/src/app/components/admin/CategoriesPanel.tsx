import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminCategory } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import { useAdminCategories, useDeleteCategory } from '../../queries/categories';
import { useAuth } from '../../auth/AuthContext';
import StatusMessage from '../StatusMessage';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function CategoriesPanel() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const [actionError, setActionError] = useState('');

  const categoriesQuery = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesQuery.data ?? [];
  const loadError = categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '';
  const error = actionError || loadError;

  const removeCategory = async (category: AdminCategory) => {
    if (!window.confirm(`${t('admin.dashboard.delete')} "${category.name.en}"?`)) return;
    try {
      await deleteCategory.mutateAsync(category._id);
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm italic opacity-70">
          {isSuperAdmin ? t('admin.categories.hint') : t('admin.categories.readOnly')}
        </p>
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

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {categoriesQuery.isPending && <StatusMessage>Loading categories...</StatusMessage>}

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
          {categories.map((category) => (
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
    </section>
  );
}
