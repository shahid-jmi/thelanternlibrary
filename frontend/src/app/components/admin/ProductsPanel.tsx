import { useState, type FormEvent } from 'react';
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
import { validatePrice, validateRequired } from '../../lib/validation';
import { useValidatedField } from '../../lib/useValidatedField';
import StatusMessage from '../StatusMessage';
import { FieldInput, FieldSelect, FieldTextArea } from '../FormField';
import ImageUploadField from '../ImageUploadField';
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
          key={editing?._id ?? 'new'}
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
  const nameEn = useValidatedField(validateRequired, product?.name.en ?? '');
  const [nameUr, setNameUr] = useState(product?.name.ur ?? '');
  const descEn = useValidatedField(validateRequired, product?.description.en ?? '');
  const [descUr, setDescUr] = useState(product?.description.ur ?? '');
  const [category, setCategory] = useState(product?.category._id ?? fallbackCategoryId);
  const price = useValidatedField(validatePrice, product ? String(product.price) : '');
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
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
    <form onSubmit={submit} noValidate className="mb-8 rounded-sm border border-border bg-card p-5">
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
          existingUrl={product?.coverImage?.url}
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
