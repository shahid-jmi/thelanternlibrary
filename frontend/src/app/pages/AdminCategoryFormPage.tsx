import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import type { CategoryPayload } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useAdminCategories, useSaveCategory } from '../queries/categories';
import { useAuth } from '../auth/AuthContext';
import { validateRequired, validateSlug } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import Loader from '../components/Loader';
import { FieldInput } from '../components/FormField';
import { Button } from '../components/ui';

export default function AdminCategoryFormPage() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const categoriesQuery = useAdminCategories();
  const saveCategory = useSaveCategory();

  if (!isSuperAdmin) {
    return <Navigate to="/admin/dashboard?tab=categories" replace />;
  }

  const category = id ? (categoriesQuery.data?.find((item) => item._id === id) ?? null) : null;

  const goBack = () => navigate('/admin/dashboard?tab=categories');

  if (id && categoriesQuery.isPending) {
    return (
      <PageFrame compact>
        <Loader label="Loading category..." />
      </PageFrame>
    );
  }

  if (id && !categoriesQuery.isPending && !category) {
    return (
      <PageFrame compact>
        <StatusMessage tone="error">{t('admin.form.notFound')}</StatusMessage>
      </PageFrame>
    );
  }

  return (
    <PageFrame compact>
      <Link
        to="/admin/dashboard?tab=categories"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.admins.backToDashboard')}
      </Link>
      <h1 className="mb-8 text-3xl tracking-[0.05em]">
        {category ? t('admin.form.editCategoryHeading') : t('admin.form.addCategoryHeading')}
      </h1>
      <CategoryForm
        key={category?._id ?? 'new'}
        initial={{
          nameEn: category?.name.en ?? '',
          nameUr: category?.name.ur ?? '',
          slug: category?.slug ?? '',
          taglineEn: category?.tagline?.en ?? '',
          taglineUr: category?.tagline?.ur ?? '',
          isActive: category?.isActive ?? true,
        }}
        onCancel={goBack}
        onSave={async (payload) => {
          await saveCategory.mutateAsync({ id: category?._id, payload });
          goBack();
        }}
      />
    </PageFrame>
  );
}

interface CategoryFormInitial {
  nameEn: string;
  nameUr: string;
  slug: string;
  taglineEn: string;
  taglineUr: string;
  isActive: boolean;
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
  initial,
  onCancel,
  onSave,
}: {
  initial: CategoryFormInitial;
  onCancel: () => void;
  onSave: (payload: CategoryPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const nameEn = useValidatedField(validateRequired, initial.nameEn);
  const [nameUr, setNameUr] = useState(initial.nameUr);
  const slug = useValidatedField(validateSlug, initial.slug);
  const [taglineEn, setTaglineEn] = useState(initial.taglineEn);
  const [taglineUr, setTaglineUr] = useState(initial.taglineUr);
  const [isActive, setIsActive] = useState(initial.isActive);
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
    <form onSubmit={submit} noValidate className="rounded-sm border border-border bg-card p-6">
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
      <div className="mt-4">
        <FieldInput
          id="category-slug"
          label={t('admin.form.slug')}
          hint={t('admin.form.slugHint')}
          dir="ltr"
          placeholder="dried-flowers"
          value={slug.value}
          onChange={slug.onChange}
          onBlur={slug.onBlur}
          error={slug.error ? t(slug.error) : undefined}
        />
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        {t('admin.admins.active')}
      </label>
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
