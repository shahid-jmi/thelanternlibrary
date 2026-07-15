import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminCategory, CategoryPayload } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import { useAdminCategories, useDeleteCategory, useSaveCategory } from '../../queries/categories';
import { useAuth } from '../../auth/AuthContext';
import StatusMessage from '../StatusMessage';
import { TextInput } from '../FormControls';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

interface CategoryFormState {
  name: { en: string; ur: string };
  slug: string;
  tagline: { en: string; ur: string };
  isActive: boolean;
}

const emptyForm: CategoryFormState = {
  name: { en: '', ur: '' },
  slug: '',
  tagline: { en: '', ur: '' },
  isActive: true,
};

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

function categoryToForm(category: AdminCategory | null): CategoryFormState {
  if (!category) return emptyForm;
  return {
    name: {
      en: category.name.en || '',
      ur: category.name.ur || '',
    },
    slug: category.slug,
    tagline: {
      en: category.tagline?.en || '',
      ur: category.tagline?.ur || '',
    },
    isActive: category.isActive,
  };
}

function formToPayload(form: CategoryFormState): CategoryPayload {
  const payload: CategoryPayload = {
    name: { en: form.name.en, ur: form.name.ur || undefined },
    slug: form.slug.trim().toLowerCase(),
    isActive: form.isActive,
  };
  if (form.tagline.en.trim()) {
    payload.tagline = { en: form.tagline.en, ur: form.tagline.ur || undefined };
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
  const [form, setForm] = useState<CategoryFormState>(() => categoryToForm(category));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(categoryToForm(category));
  }, [category]);

  const setNested = (group: 'name' | 'tagline', field: 'en' | 'ur', value: string) => {
    setForm((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(formToPayload(form));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label={t('admin.form.nameEn')}
          value={form.name.en}
          onChange={(value) => setNested('name', 'en', value)}
          dir="ltr"
          required
        />
        <TextInput
          label={t('admin.form.nameUr')}
          value={form.name.ur}
          onChange={(value) => setNested('name', 'ur', value)}
          dir="rtl"
        />
        <label className="block text-sm">
          {t('admin.form.slug')}
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            dir="ltr"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title={t('admin.form.slugHint')}
            placeholder="dried-flowers"
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 font-mono text-sm outline-none focus:border-ring"
          />
          <span className="mt-1 block text-xs italic opacity-60">{t('admin.form.slugHint')}</span>
        </label>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          {t('admin.admins.active')}
        </label>
        <TextInput
          label={t('admin.form.taglineEn')}
          value={form.tagline.en}
          onChange={(value) => setNested('tagline', 'en', value)}
          dir="ltr"
        />
        <TextInput
          label={t('admin.form.taglineUr')}
          value={form.tagline.ur}
          onChange={(value) => setNested('tagline', 'ur', value)}
          dir="rtl"
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
