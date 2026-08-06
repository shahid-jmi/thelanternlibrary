import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import type { AdminCategory } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useAdminProducts, useSaveProduct } from '../queries/products';
import { useAdminCategories } from '../queries/categories';
import { validatePrice, validateRequired } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import { FieldInput, FieldSelect, FieldTextArea } from '../components/FormField';
import ImageUploadField from '../components/ImageUploadField';
import { Button } from '../components/ui';

export default function AdminProductFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const saveProduct = useSaveProduct();

  const product = id ? (productsQuery.data?.find((item) => item._id === id) ?? null) : null;
  const categories = categoriesQuery.data ?? [];

  const goBack = () => navigate('/admin/dashboard?tab=products');

  if ((id && productsQuery.isPending) || categoriesQuery.isPending) {
    return (
      <PageFrame compact>
        <StatusMessage>Loading product...</StatusMessage>
      </PageFrame>
    );
  }

  if (id && !productsQuery.isPending && !product) {
    return (
      <PageFrame compact>
        <StatusMessage tone="error">{t('admin.form.notFound')}</StatusMessage>
      </PageFrame>
    );
  }

  const fallbackCategoryId = categories.find((category) => category.isActive)?._id ?? '';

  return (
    <PageFrame compact>
      <Link
        to="/admin/dashboard?tab=products"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.admins.backToDashboard')}
      </Link>
      <h1 className="mb-8 text-3xl tracking-[0.05em]">
        {product ? t('admin.form.editProductHeading') : t('admin.form.addProductHeading')}
      </h1>
      <ProductForm
        key={product?._id ?? 'new'}
        initial={{
          nameEn: product?.name.en ?? '',
          nameUr: product?.name.ur ?? '',
          descEn: product?.description.en ?? '',
          descUr: product?.description.ur ?? '',
          category: product?.category._id ?? fallbackCategoryId,
          price: product ? String(product.price) : '',
          isAvailable: product?.isAvailable ?? true,
        }}
        coverImageUrl={product?.coverImage?.url}
        categories={categories}
        onCancel={goBack}
        onSave={async (payload, coverImageFile) => {
          await saveProduct.mutateAsync({ id: product?._id, payload, coverImageFile });
          goBack();
        }}
      />
    </PageFrame>
  );
}

interface ProductFormInitial {
  nameEn: string;
  nameUr: string;
  descEn: string;
  descUr: string;
  category: string;
  price: string;
  isAvailable: boolean;
}

function ProductForm({
  initial,
  coverImageUrl,
  categories,
  onCancel,
  onSave,
}: {
  initial: ProductFormInitial;
  coverImageUrl?: string;
  categories: AdminCategory[];
  onCancel: () => void;
  onSave: (
    payload: {
      name: { en: string; ur: string };
      description: { en: string; ur: string };
      category: string;
      price: number;
      isAvailable: boolean;
    },
    coverImageFile: File | null
  ) => Promise<void>;
}) {
  const { t } = useTranslation();
  const nameEn = useValidatedField(validateRequired, initial.nameEn);
  const [nameUr, setNameUr] = useState(initial.nameUr);
  const descEn = useValidatedField(validateRequired, initial.descEn);
  const [descUr, setDescUr] = useState(initial.descUr);
  const [category, setCategory] = useState(initial.category);
  const price = useValidatedField(validatePrice, initial.price);
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [nameEn.validateNow(), descEn.validateNow(), price.validateNow()];
    if (errors.some(Boolean)) return;

    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          name: { en: nameEn.value, ur: nameUr },
          description: { en: descEn.value, ur: descUr },
          category,
          price: Number(price.value),
          isAvailable,
        },
        coverImageFile
      );
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
          id="product-name-en"
          label={t('admin.form.nameEn')}
          dir="ltr"
          value={nameEn.value}
          onChange={nameEn.onChange}
          onBlur={nameEn.onBlur}
          error={nameEn.error ? t(nameEn.error) : undefined}
        />
        <FieldInput
          id="product-name-ur"
          label={t('admin.form.nameUr')}
          dir="rtl"
          value={nameUr}
          onChange={setNameUr}
        />
        <FieldTextArea
          id="product-desc-en"
          label={t('admin.form.descEn')}
          dir="ltr"
          value={descEn.value}
          onChange={descEn.onChange}
          onBlur={descEn.onBlur}
          error={descEn.error ? t(descEn.error) : undefined}
        />
        <FieldTextArea
          id="product-desc-ur"
          label={t('admin.form.descUr')}
          dir="rtl"
          value={descUr}
          onChange={setDescUr}
        />
        <FieldSelect
          id="product-category"
          label={t('admin.form.category')}
          value={category}
          onChange={setCategory}
        >
          {categories.map((item) => (
            <option key={item._id} value={item._id} disabled={!item.isActive}>
              {item.name.en}
              {!item.isActive ? ` (${t('admin.admins.inactive').toLowerCase()})` : ''}
            </option>
          ))}
        </FieldSelect>
        <FieldInput
          id="product-price"
          type="number"
          min="0"
          step="0.01"
          label={t('admin.form.price')}
          value={price.value}
          onChange={price.onChange}
          onBlur={price.onBlur}
          error={price.error ? t(price.error) : undefined}
        />
        <ImageUploadField
          label={t('admin.form.coverImage')}
          file={coverImageFile}
          onFileChange={setCoverImageFile}
          existingUrl={coverImageUrl}
        />
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(event) => setIsAvailable(event.target.checked)}
          />
          {t('admin.dashboard.available')}
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving}>{t('admin.form.saveProduct')}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('admin.form.cancel')}
        </Button>
      </div>
    </form>
  );
}
