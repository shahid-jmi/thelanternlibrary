import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Search } from 'lucide-react';
import type { AdminOrder, OrderStatus } from '../../api/types';
import { getErrorMessage } from '../../api/client';
import { useAdminOrders, useDownloadInvoice, useUpdateOrderStatus } from '../../queries/orders';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import { formatPrice } from '../../lib/format';
import StatusMessage from '../StatusMessage';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function OrdersPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [actionError, setActionError] = useState('');
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
      {ordersQuery.isPending && <StatusMessage>{t('admin.orders.loading')}</StatusMessage>}
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
                <Td>{formatPrice(order.price)}</Td>
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
                        <Button variant="outline" size="sm" onClick={() => setStatus(order, 'paid')}>
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
    </section>
  );
}
