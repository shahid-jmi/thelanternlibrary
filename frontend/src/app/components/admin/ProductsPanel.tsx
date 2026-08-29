import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminProduct } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import {
  useAdminProducts,
  useDeleteProduct,
  useToggleProductAvailability,
} from '../../queries/products';
import { useAdminCategories } from '../../queries/categories';
import { formatPrice } from '../../lib/format';
import { useConfirm } from '../../lib/useConfirm';
import StatusMessage from '../StatusMessage';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function ProductsPanel() {
  const { t } = useTranslation();
  const [actionError, setActionError] = useState('');
  const { confirm, dialog } = useConfirm();

  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const deleteProduct = useDeleteProduct();
  const toggleAvailability = useToggleProductAvailability();

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadError =
    (productsQuery.isError ? getErrorMessage(productsQuery.error) : '') ||
    (categoriesQuery.isError ? getErrorMessage(categoriesQuery.error) : '');
  const error = actionError || loadError;

  const activeCategories = categories.filter((category) => category.isActive);

  const removeProduct = async (product: AdminProduct) => {
    if (!(await confirm(`${t('admin.dashboard.delete')} "${product.name.en}"?`))) return;
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
      {productsQuery.isPending && <StatusMessage>Loading products...</StatusMessage>}
      {!categoriesQuery.isPending && activeCategories.length === 0 && (
        <StatusMessage>{t('admin.products.noCategories')}</StatusMessage>
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
