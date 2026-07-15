import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminCategory, AdminProduct, ProductPayload } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import {
  useAdminProducts,
  useDeleteProduct,
  useSaveProduct,
  useToggleProductAvailability,
} from '../../queries/products';
import { useAdminCategories } from '../../queries/categories';
import { formatPrice } from '../../lib/format';
import StatusMessage from '../StatusMessage';
import { TextArea, TextInput } from '../FormControls';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function ProductsPanel() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');

  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const saveProduct = useSaveProduct();
  const deleteProduct = useDeleteProduct();
  const toggleAvailability = useToggleProductAvailability();

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadError =
    (productsQuery.isError ? getErrorMessage(productsQuery.error) : '') ||
    (categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '');
  const error = actionError || loadError;

  const activeCategories = categories.filter((category) => category.isActive);

  const handleSave = async (payload: ProductPayload, coverImageFile: File | null) => {
    await saveProduct.mutateAsync({ id: editing?._id, payload, coverImageFile });
    setEditing(null);
    setShowForm(false);
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(`${t('admin.dashboard.delete')} "${product.name.en}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product._id);
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const flipAvailability = async (product: AdminProduct) => {
    try {
      await toggleAvailability.mutateAsync({
        id: product._id,
        isAvailable: !product.isAvailable,
      });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  return (
    <section>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          disabled={activeCategories.length === 0}
        >
          <Plus className="h-4 w-4" />
          {t('admin.dashboard.addProduct')}
        </Button>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {productsQuery.isPending && <StatusMessage>Loading products...</StatusMessage>}
      {!categoriesQuery.isPending && activeCategories.length === 0 && (
        <StatusMessage>{t('admin.products.noCategories')}</StatusMessage>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
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
            <Th>{t('admin.form.category')}</Th>
            <Th>{t('book.price')}</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </TableHead>
        <tbody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <Td>{product.name.en}</Td>
              <Td>
                {product.category.name.en}
                {!product.category.isActive && (
                  <span className="ml-2 text-xs italic opacity-60 rtl:ml-0 rtl:mr-2">
                    ({t('admin.admins.inactive')})
                  </span>
                )}
              </Td>
              <Td>{formatPrice(product.price)}</Td>
              <Td>
                <button onClick={() => flipAvailability(product)}>
                  <Badge active={product.isAvailable} className="inline-flex items-center gap-2">
                    {product.isAvailable && <Check className="h-3.5 w-3.5" />}
                    {product.isAvailable
                      ? t('admin.dashboard.available')
                      : t('admin.dashboard.unavailable')}
                  </Badge>
                </button>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    {t('admin.dashboard.edit')}
                  </Button>
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    onClick={() => removeProduct(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('admin.dashboard.delete')}
                  </Button>
                </div>
              </Td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </section>
  );
}

function productToPayload(
  product: AdminProduct | null,
  fallbackCategoryId: string
): ProductPayload {
  if (!product) {
    return {
      name: { en: '', ur: '' },
      description: { en: '', ur: '' },
      category: fallbackCategoryId,
      price: 0,
      isAvailable: true,
    };
  }
  return {
    name: {
      en: product.name.en || '',
      ur: product.name.ur || '',
    },
    description: {
      en: product.description.en || '',
      ur: product.description.ur || '',
    },
    category: product.category._id,
    price: product.price || 0,
    isAvailable: product.isAvailable,
  };
}

function ProductForm({
  product,
  categories,
  onCancel,
  onSave,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onCancel: () => void;
  onSave: (payload: ProductPayload, coverImageFile: File | null) => Promise<void>;
}) {
  const { t } = useTranslation();
  const fallbackCategoryId = categories.find((category) => category.isActive)?._id ?? '';
  const [form, setForm] = useState<ProductPayload>(() =>
    productToPayload(product, fallbackCategoryId)
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(productToPayload(product, fallbackCategoryId));
    setCoverImageFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const setField = (field: keyof ProductPayload, value: string | number | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setNested = (group: 'name' | 'description', field: 'en' | 'ur', value: string) => {
    setForm((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          ...form,
          price: Number(form.price),
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
          value={form.name.ur || ''}
          onChange={(value) => setNested('name', 'ur', value)}
          dir="rtl"
        />
        <TextArea
          label={t('admin.form.descEn')}
          value={form.description.en}
          onChange={(value) => setNested('description', 'en', value)}
          dir="ltr"
          required
        />
        <TextArea
          label={t('admin.form.descUr')}
          value={form.description.ur || ''}
          onChange={(value) => setNested('description', 'ur', value)}
          dir="rtl"
        />
        <label className="block text-sm">
          {t('admin.form.category')}
          <select
            value={form.category}
            onChange={(event) => setField('category', event.target.value)}
            required
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id} disabled={!category.isActive}>
                {category.name.en}
                {!category.isActive ? ` (${t('admin.admins.inactive').toLowerCase()})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          {t('admin.form.price')}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setField('price', Number(event.target.value))}
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
            required
          />
        </label>
        <label className="block text-sm">
          {t('admin.form.coverImage')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          {product?.coverImage?.url && !coverImageFile && (
            <img
              src={product.coverImage.url}
              alt=""
              className="mt-2 h-24 w-16 rounded-sm border border-border object-cover"
            />
          )}
        </label>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(event) => setField('isAvailable', event.target.checked)}
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
