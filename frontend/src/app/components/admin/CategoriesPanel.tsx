import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminCategory, CategoryPayload } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import { useAdminCategories, useDeleteCategory, useSaveCategory } from '../../queries/categories';
import { useAuth } from '../../auth/AuthContext';
import { validateRequired, validateSlug } from '../../lib/validation';
import { useValidatedField } from '../../lib/useValidatedField';
import StatusMessage from '../StatusMessage';
import { FieldInput } from '../FormField';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function CategoriesPanel() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');

  const categoriesQuery = useAdminCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesQuery.data ?? [];
  const loadError = categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '';
  const error = actionError || loadError;

  const handleSave = async (payload: CategoryPayload) => {
    await saveCategory.mutateAsync({ id: editing?._id, payload });
    setEditing(null);
    setShowForm(false);
  };

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
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t('admin.dashboard.addCategory')}
          </Button>
        )}
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {categoriesQuery.isPending && <StatusMessage>Loading categories...</StatusMessage>}

      {showForm && isSuperAdmin && (
        <CategoryForm
          key={editing?._id ?? 'new'}
          category={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
          onSave={handleSave}
        />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(category);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      {t('admin.dashboard.edit')}
                    </Button>
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

function formToPayload(
  nameEn: string,
  nameUr: string,
  slug: string,
  taglineEn: string,
  taglineUr: string,
  isActive: boolean
): CategoryPayload {
  const payload: CategoryPayload = {
    name: { en: nameEn, ur: nameUr || undefined },
    slug: slug.trim().toLowerCase(),
    isActive,
  };
  if (taglineEn.trim()) {
    payload.tagline = { en: taglineEn, ur: taglineUr || undefined };
  }
  return payload;
}

function CategoryForm({
  category,
  onCancel,
  onSave,
}: {
  category: AdminCategory | null;
  onCancel: () => void;
  onSave: (payload: CategoryPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const nameEn = useValidatedField(validateRequired, category?.name.en ?? '');
  const [nameUr, setNameUr] = useState(category?.name.ur ?? '');
  const slug = useValidatedField(validateSlug, category?.slug ?? '');
  const [taglineEn, setTaglineEn] = useState(category?.tagline?.en ?? '');
  const [taglineUr, setTaglineUr] = useState(category?.tagline?.ur ?? '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [nameEn.validateNow(), slug.validateNow()];
    if (errors.some(Boolean)) return;

    setSaving(true);
    setError('');
    try {
      await onSave(formToPayload(nameEn.value, nameUr, slug.value, taglineEn, taglineUr, isActive));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldInput
          id="category-name-en"
          label={t('admin.form.nameEn')}
          dir="ltr"
          value={nameEn.value}
          onChange={nameEn.onChange}
          onBlur={nameEn.onBlur}
          error={nameEn.error ? t(nameEn.error) : undefined}
        />
        <FieldInput
          id="category-name-ur"
          label={t('admin.form.nameUr')}
          dir="rtl"
          value={nameUr}
          onChange={setNameUr}
        />
        <div>
          <FieldInput
            id="category-slug"
            label={t('admin.form.slug')}
            dir="ltr"
            placeholder="dried-flowers"
            value={slug.value}
            onChange={slug.onChange}
            onBlur={slug.onBlur}
            error={slug.error ? t(slug.error) : undefined}
          />
          <p className="mt-1 text-xs italic opacity-60">{t('admin.form.slugHint')}</p>
        </div>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          {t('admin.admins.active')}
        </label>
        <FieldInput
          id="category-tagline-en"
          label={t('admin.form.taglineEn')}
          dir="ltr"
          value={taglineEn}
          onChange={setTaglineEn}
        />
        <FieldInput
          id="category-tagline-ur"
          label={t('admin.form.taglineUr')}
          dir="rtl"
          value={taglineUr}
          onChange={setTaglineUr}
        />
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving}>{t('admin.form.saveCategory')}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('admin.form.cancel')}
        </Button>
      </div>
    </form>
  );
}
