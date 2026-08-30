import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, Edit, Plus, Search, Trash2 } from 'lucide-react';
import type { AdminProduct } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import {
  useAdminProducts,
  useDeleteProduct,
  useToggleProductAvailability,
  useToggleProductFeatured,
} from '@/app/queries/products';
import { useAdminCategories } from '@/app/queries/categories';
import { formatPrice } from '@/app/lib/format';
import { useConfirm } from '@/app/lib/useConfirm';
import { useConfirmedDelete } from '@/app/lib/useConfirmedDelete';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';

export default function ProductsPanel() {
  const { t } = useTranslation();
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const { confirm, dialog } = useConfirm();

  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const deleteProduct = useDeleteProduct();
  const toggleAvailability = useToggleProductAvailability();
  const toggleFeatured = useToggleProductFeatured();

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadError =
    (productsQuery.isError ? getErrorMessage(productsQuery.error) : '') ||
    (categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '');
  const error = actionError || loadError;

  const activeCategories = categories.filter((category) => category.isActive);

  const query = debouncedSearch.trim().toLowerCase();
  const filteredProducts = query
    ? products.filter(
        (product) =>
          product.name.en.toLowerCase().includes(query) ||
          product.name.ur?.toLowerCase().includes(query)
      )
    : products;

  const confirmedDelete = useConfirmedDelete(deleteProduct, confirm, setActionError);
  const removeProduct = (product: AdminProduct) =>
    confirmedDelete(product._id, `${t('admin.dashboard.delete')} "${product.name.en}"?`);

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

  const flipFeatured = async (product: AdminProduct) => {
    try {
      await toggleFeatured.mutateAsync({
        id: product._id,
        isFeatured: !product.isFeatured,
      });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.dashboard.searchProducts')}
            className="h-11 w-full min-w-64 rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
          />
        </div>
        {activeCategories.length === 0 ? (
          <Button disabled>
            <Plus className="h-4 w-4" />
            {t('admin.dashboard.addProduct')}
          </Button>
        ) : (
          <Link
            to="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-5 text-sm text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('admin.dashboard.addProduct')}
          </Link>
        )}
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {productsQuery.isPending && <Loader label="Loading products..." />}
      {!categoriesQuery.isPending && activeCategories.length === 0 && (
        <StatusMessage>{t('admin.products.noCategories')}</StatusMessage>
      )}
      {!productsQuery.isPending && products.length > 0 && filteredProducts.length === 0 && (
        <StatusMessage>{t('admin.dashboard.noResults')}</StatusMessage>
      )}

      <Table>
        <TableHead>
          <tr>
            <Th>Name</Th>
            <Th>{t('admin.form.category')}</Th>
            <Th>{t('book.price')}</Th>
            <Th>Status</Th>
            <Th>{t('admin.dashboard.featured')}</Th>
            <Th>Actions</Th>
          </tr>
        </TableHead>
        <tbody>
          {filteredProducts.map((product) => (
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
                <button onClick={() => flipFeatured(product)}>
                  <Badge active={product.isFeatured} className="inline-flex items-center gap-2">
                    {product.isFeatured && <Check className="h-3.5 w-3.5" />}
                    {product.isFeatured
                      ? t('admin.dashboard.featured')
                      : t('admin.dashboard.notFeatured')}
                  </Badge>
                </button>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm transition hover:bg-secondary"
                  >
                    <Edit className="h-4 w-4" />
                    {t('admin.dashboard.edit')}
                  </Link>
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

      {dialog}
    </section>
  );
}
