import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, Search } from 'lucide-react';
import type { AdminOrder, OrderStatus } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import { useAdminOrders, useDownloadInvoice, useUpdateOrderStatus } from '../../queries/orders';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import { validatePrice } from '../../lib/validation';
import { useValidatedField } from '../../lib/useValidatedField';
import { formatPrice } from '../../lib/format';
import StatusMessage from '../StatusMessage';
import Loader from '../Loader';
import { FieldInput } from '../FormField';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function OrdersPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [actionError, setActionError] = useState('');
  const [markingPaidOrder, setMarkingPaidOrder] = useState<AdminOrder | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const ordersQuery = useAdminOrders({ search: debouncedSearch, sort });
  const updateStatus = useUpdateOrderStatus();
  const downloadInvoice = useDownloadInvoice();

  const orders = ordersQuery.data ?? [];
  const loadError = ordersQuery.isError ? getErrorMessage(ordersQuery.error) : '';
  const error = actionError || loadError;

  const setStatus = async (order: AdminOrder, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order._id, status });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const confirmMarkPaid = async (deliveryCharge: number) => {
    if (!markingPaidOrder) return;
    try {
      await updateStatus.mutateAsync({ id: markingPaidOrder._id, status: 'paid', deliveryCharge });
      setActionError('');
      setMarkingPaidOrder(null);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const getInvoice = async (order: AdminOrder) => {
    try {
      const blob = await downloadInvoice.mutateAsync(order._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.invoiceNumber ?? order._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
            placeholder={t('admin.orders.search')}
            className="h-11 w-full min-w-64 rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
          />
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}
          className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
        >
          <option value="newest">{t('admin.orders.sortNewest')}</option>
          <option value="oldest">{t('admin.orders.sortOldest')}</option>
        </select>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {ordersQuery.isPending && <Loader label={t('admin.orders.loading')} />}
      {!ordersQuery.isPending && orders.length === 0 && (
        <StatusMessage>{t('admin.orders.noOrders')}</StatusMessage>
      )}

      {orders.length > 0 && (
        <Table>
          <TableHead>
            <tr>
              <Th>{t('admin.orders.book')}</Th>
              <Th>{t('admin.orders.customer')}</Th>
              <Th>{t('admin.orders.phone')}</Th>
              <Th>{t('book.price')}</Th>
              <Th>{t('admin.admins.status')}</Th>
              <Th>{t('admin.orders.date')}</Th>
              <Th>{t('admin.admins.actions')}</Th>
            </tr>
          </TableHead>
          <tbody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <Td>
                  <div>{order.bookTitle}</div>
                  <div className="text-xs italic opacity-60">{order.bookAuthor}</div>
                </Td>
                <Td>
                  <div>{order.customerName}</div>
                  <div className="max-w-[220px] truncate text-xs opacity-60">
                    {`${order.addressLine}, ${order.locality}, ${order.city}, ${order.state} - ${order.pincode}`}
                  </div>
                </Td>
                <Td>
                  <div>{order.customerPhone}</div>
                  {order.customerAltPhone && (
                    <div className="text-xs opacity-60">{order.customerAltPhone}</div>
                  )}
                </Td>
                <Td>
                  <div>{formatPrice(order.price)}</div>
                  {order.status === 'paid' && order.deliveryCharge > 0 && (
                    <div className="text-xs opacity-60">
                      + {formatPrice(order.deliveryCharge)} {t('admin.orders.deliveryLabel')}
                    </div>
                  )}
                </Td>
                <Td>
                  <Badge
                    active={order.status === 'paid'}
                    className={order.status === 'cancelled' ? 'text-destructive' : ''}
                  >
                    {t(`admin.orders.status.${order.status}`)}
                  </Badge>
                </Td>
                <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMarkingPaidOrder(order)}
                        >
                          {t('admin.orders.markPaid')}
                        </Button>
                        <Button
                          variant="destructive-outline"
                          size="sm"
                          onClick={() => setStatus(order, 'cancelled')}
                        >
                          {t('admin.orders.markCancelled')}
                        </Button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <Button variant="outline" size="sm" onClick={() => getInvoice(order)}>
                        <Download className="h-4 w-4" />
                        {t('admin.orders.downloadInvoice')}
                      </Button>
                    )}
                  </div>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {markingPaidOrder && (
        <MarkPaidModal
          key={markingPaidOrder._id}
          order={markingPaidOrder}
          submitting={updateStatus.isPending}
          onCancel={() => setMarkingPaidOrder(null)}
          onConfirm={confirmMarkPaid}
        />
      )}
    </section>
  );
}

function MarkPaidModal({
  order,
  submitting,
  onCancel,
  onConfirm,
}: {
  order: AdminOrder;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (deliveryCharge: number) => void;
}) {
  const { t } = useTranslation();
  const deliveryCharge = useValidatedField(validatePrice);
  const total = order.price + (Number(deliveryCharge.value) || 0);

  const confirm = () => {
    if (deliveryCharge.validateNow()) return;
    onConfirm(Number(deliveryCharge.value));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-popover p-6 text-popover-foreground">
        <h2 className="text-lg tracking-[0.05em]">{t('admin.orders.confirmPayment')}</h2>
        <p className="mt-2 text-sm opacity-70">{t('admin.orders.deliveryChargeIntro')}</p>

        <div className="mt-4 flex items-center justify-between rounded-sm border border-border bg-input-background px-3 py-2 text-sm">
          <span className="opacity-70">{order.bookTitle}</span>
          <span>{formatPrice(order.price)}</span>
        </div>

        <div className="mt-4">
          <FieldInput
            id="delivery-charge"
            type="number"
            min="0"
            step="0.01"
            label={t('admin.orders.deliveryCharge')}
            value={deliveryCharge.value}
            onChange={deliveryCharge.onChange}
            onBlur={deliveryCharge.onBlur}
            error={deliveryCharge.error ? t(deliveryCharge.error) : undefined}
          />
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="uppercase tracking-label opacity-70">{t('admin.orders.orderTotal')}</span>
          <span className="text-ember">{formatPrice(total)}</span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={confirm}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-ember text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('admin.orders.markPaid')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm"
          >
            {t('admin.form.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
