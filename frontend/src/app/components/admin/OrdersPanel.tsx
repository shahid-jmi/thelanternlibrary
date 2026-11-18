import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronDown, ChevronUp, Download, Search } from 'lucide-react';
import { ORDER_VIEWS, type AdminOrder, type OrderView, type PaymentMethod } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import {
  useAdminOrders,
  useDownloadReceipt,
  useOrderViewCounts,
  useResolveAttention,
  useUpdateDeliveryCharge,
  useUpdateOrderStatus,
  useUpdatePayment,
} from '@/app/queries/orders';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/cn';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';
import {
  ConfirmOrderActionDialog,
  RecordPaymentDialog,
  ShipDialog,
} from '@/app/components/admin/OrderActionDialogs';

const PAGE_SIZE = 25;

type PendingAction =
  | { kind: 'pay'; order: AdminOrder }
  | { kind: 'ship'; order: AdminOrder }
  | { kind: 'cancel'; order: AdminOrder }
  | { kind: 'unpay'; order: AdminOrder }
  | { kind: 'refund'; order: AdminOrder }
  | { kind: 'resolve'; order: AdminOrder; skipStock: boolean };

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function OrdersPanel() {
  const { t } = useTranslation();
  const [view, setView] = useState<OrderView>('to_ship');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const ordersQuery = useAdminOrders({
    view,
    search: debouncedSearch,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const countsQuery = useOrderViewCounts();
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePayment();
  const updateDeliveryCharge = useUpdateDeliveryCharge();
  const resolveAttention = useResolveAttention();
  const downloadReceipt = useDownloadReceipt();

  const orders = ordersQuery.data?.orders ?? [];
  const total = ordersQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loadError = ordersQuery.isError ? getErrorMessage(ordersQuery.error) : '';
  const error = actionError || loadError;
  const submitting =
    updateStatus.isPending ||
    updatePayment.isPending ||
    updateDeliveryCharge.isPending ||
    resolveAttention.isPending;

  const run = async (task: () => Promise<unknown>) => {
    try {
      await task();
      setActionError('');
      setAction(null);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
      setAction(null);
    }
  };

  const changeView = (next: OrderView) => {
    setView(next);
    setPage(1);
  };

  const recordPayment = (
    order: AdminOrder,
    input: { method: PaymentMethod; deliveryCharge: number; note: string }
  ) =>
    run(async () => {
      if (input.deliveryCharge !== order.deliveryCharge) {
        await updateDeliveryCharge.mutateAsync({
          id: order._id,
          deliveryCharge: input.deliveryCharge,
        });
      }
      await updatePayment.mutateAsync({
        id: order._id,
        paymentStatus: 'paid',
        method: input.method,
        note: input.note || undefined,
      });
    });

  const getReceipt = async (order: AdminOrder) => {
    try {
      const blob = await downloadReceipt.mutateAsync(order._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const setStatus = (order: AdminOrder, status: AdminOrder['status']) =>
    run(() => updateStatus.mutateAsync({ id: order._id, status }));

  const rowActions = (order: AdminOrder) => {
    const paid = order.paymentStatus === 'paid';
    const open = order.status === 'placed' || order.status === 'packed';
    return (
      <div className="flex flex-wrap gap-2">
        {order.needsAttention && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAction({ kind: 'resolve', order, skipStock: false })}
          >
            {t('admin.orders.resolve')}
          </Button>
        )}
        {open && !paid && (
          <Button size="sm" onClick={() => setAction({ kind: 'pay', order })}>
            {t('admin.orders.recordPayment')}
          </Button>
        )}
        {order.status === 'placed' && (
          <Button variant="outline" size="sm" onClick={() => setStatus(order, 'packed')}>
            {t('admin.orders.markPacked')}
          </Button>
        )}
        {((open && paid) || order.status === 'returned') && (
          <Button size="sm" onClick={() => setAction({ kind: 'ship', order })}>
            {order.status === 'returned' ? t('admin.orders.reship') : t('admin.orders.ship')}
          </Button>
        )}
        {order.status === 'shipped' && (
          <>
            <Button variant="outline" size="sm" onClick={() => setStatus(order, 'delivered')}>
              {t('admin.orders.markDelivered')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatus(order, 'returned')}>
              {t('admin.orders.markReturned')}
            </Button>
          </>
        )}
        {paid && (order.status === 'cancelled' || order.status === 'returned') && (
          <Button variant="outline" size="sm" onClick={() => setAction({ kind: 'refund', order })}>
            {t('admin.orders.markRefunded')}
          </Button>
        )}
        {order.paymentStatus !== 'unpaid' && (
          <Button variant="outline" size="sm" onClick={() => getReceipt(order)}>
            <Download className="h-4 w-4" />
            {t('admin.orders.receipt')}
          </Button>
        )}
        {(open || order.status === 'returned') && (
          <Button
            variant="destructive-outline"
            size="sm"
            onClick={() => setAction({ kind: 'cancel', order })}
          >
            {t('admin.orders.markCancelled')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <section>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {ORDER_VIEWS.map((item) => {
          const count = countsQuery.data?.[item];
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={view === item}
              onClick={() => changeView(item)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-sm border px-3 text-sm transition',
                view === item
                  ? 'border-ember bg-ember/10 text-ember'
                  : 'border-border hover:bg-secondary',
                item === 'attention' && count ? 'text-destructive' : ''
              )}
            >
              {t(`admin.orders.view.${item}`)}
              {count !== undefined && <span className="text-xs opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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
              <Th>{t('admin.orders.order')}</Th>
              <Th>{t('admin.orders.items')}</Th>
              <Th>{t('admin.orders.customer')}</Th>
              <Th>{t('admin.orders.orderTotal')}</Th>
              <Th>{t('admin.admins.status')}</Th>
              <Th>{t('admin.admins.actions')}</Th>
            </tr>
          </TableHead>
          <tbody>
            {orders.map((order) => {
              const expanded = expandedId === order._id;
              const [firstItem, ...otherItems] = order.items;
              return (
                <Fragment key={order._id}>
                  <TableRow className={cn(order.needsAttention && 'bg-destructive/5')}>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : order._id)}
                        aria-expanded={expanded}
                        className="inline-flex items-center gap-1 text-left hover:text-ember"
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {order.orderNumber}
                      </button>
                      <div className="text-xs opacity-60">{formatDate(order.createdAt)}</div>
                      {order.isLegacy && (
                        <div className="text-xs italic opacity-60">{t('admin.orders.legacy')}</div>
                      )}
                    </Td>
                    <Td>
                      <div className="max-w-[220px] truncate">
                        {firstItem && `${firstItem.quantity} × ${firstItem.title}`}
                      </div>
                      {otherItems.length > 0 && (
                        <div className="text-xs opacity-60">
                          {t('admin.orders.moreItems', { count: otherItems.length })}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div>{order.customerName}</div>
                      <div className="text-xs opacity-60">{order.customerPhone}</div>
                      <div className="text-xs opacity-60">
                        {order.city}, {order.state}
                      </div>
                    </Td>
                    <Td>
                      <div>{formatPrice(order.total)}</div>
                      <div className="text-xs opacity-60">
                        {order.deliveryCharge === 0
                          ? t('admin.orders.freeDelivery')
                          : `${t('admin.orders.delivery')} ${formatPrice(order.deliveryCharge)}`}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge className={order.status === 'cancelled' ? 'text-destructive' : ''}>
                          {t(`admin.orders.status.${order.status}`)}
                        </Badge>
                        <span
                          className={cn(
                            'text-xs',
                            order.paymentStatus === 'paid' ? 'text-emerald-600' : 'opacity-70'
                          )}
                        >
                          {t(`admin.orders.payment.${order.paymentStatus}`)}
                        </span>
                        {order.needsAttention && (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {t('admin.orders.needsAttention')}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>{rowActions(order)}</Td>
                  </TableRow>
                  {expanded && (
                    <tr className="border-b border-border/70 bg-secondary/40">
                      <td colSpan={6} className="px-4 py-4">
                        <OrderDetails
                          order={order}
                          onUnpay={() => setAction({ kind: 'unpay', order })}
                          onResolveSkip={() =>
                            setAction({ kind: 'resolve', order, skipStock: true })
                          }
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      )}

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="opacity-70">
            {t('admin.orders.pageOf', { page, pages: pageCount, total })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t('admin.orders.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              {t('admin.orders.next')}
            </Button>
          </div>
        </div>
      )}

      {action?.kind === 'pay' && (
        <RecordPaymentDialog
          order={action.order}
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(input) => recordPayment(action.order, input)}
        />
      )}
      {action?.kind === 'ship' && (
        <ShipDialog
          order={action.order}
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(input) =>
            run(() =>
              updateStatus.mutateAsync({
                id: action.order._id,
                status: 'shipped',
                courier: input.courier,
                trackingNumber: input.trackingNumber || undefined,
                trackingUrl: input.trackingUrl || undefined,
              })
            )
          }
        />
      )}
      {action?.kind === 'cancel' && (
        <ConfirmOrderActionDialog
          title={t('admin.orders.cancelTitle', { number: action.order.orderNumber })}
          message={
            action.order.paymentStatus === 'paid'
              ? t('admin.orders.cancelPaidMessage')
              : t('admin.orders.cancelMessage')
          }
          confirmLabel={t('admin.orders.markCancelled')}
          destructive
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(note) =>
            run(() =>
              updateStatus.mutateAsync({
                id: action.order._id,
                status: 'cancelled',
                note: note || undefined,
              })
            )
          }
        />
      )}
      {action?.kind === 'unpay' && (
        <ConfirmOrderActionDialog
          title={t('admin.orders.unpayTitle')}
          message={t('admin.orders.unpayMessage')}
          confirmLabel={t('admin.orders.markUnpaid')}
          destructive
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(note) =>
            run(() =>
              updatePayment.mutateAsync({
                id: action.order._id,
                paymentStatus: 'unpaid',
                note: note || undefined,
              })
            )
          }
        />
      )}
      {action?.kind === 'refund' && (
        <ConfirmOrderActionDialog
          title={t('admin.orders.refundTitle')}
          message={t('admin.orders.refundMessage', { amount: formatPrice(action.order.total) })}
          confirmLabel={t('admin.orders.markRefunded')}
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(note) =>
            run(() =>
              updatePayment.mutateAsync({
                id: action.order._id,
                paymentStatus: 'refunded',
                note: note || undefined,
              })
            )
          }
        />
      )}
      {action?.kind === 'resolve' && (
        <ConfirmOrderActionDialog
          title={t('admin.orders.resolveTitle')}
          message={
            action.skipStock
              ? t('admin.orders.resolveSkipMessage')
              : action.order.stockPending
                ? t('admin.orders.resolveStockMessage')
                : (action.order.attentionReason ?? '')
          }
          confirmLabel={t('admin.orders.resolve')}
          submitting={submitting}
          onCancel={() => setAction(null)}
          onConfirm={(note) =>
            run(() =>
              resolveAttention.mutateAsync({
                id: action.order._id,
                skipStock: action.skipStock,
                note: note || undefined,
              })
            )
          }
        />
      )}
    </section>
  );
}

function OrderDetails({
  order,
  onUnpay,
  onResolveSkip,
}: {
  order: AdminOrder;
  onUnpay: () => void;
  onResolveSkip: () => void;
}) {
  const { t } = useTranslation();
  const { shipment } = order;

  return (
    <div className="grid gap-6 text-sm md:grid-cols-3">
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-label opacity-60">
          {t('admin.orders.items')}
        </h3>
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={`${item.itemType}-${item.itemId}`} className="flex justify-between gap-3">
              <span>
                {item.quantity} × {item.title}
                {item.subtitle && <span className="opacity-60"> — {item.subtitle}</span>}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 space-y-0.5 border-t border-border pt-2 opacity-80">
          <div className="flex justify-between">
            <span>{t('admin.orders.subtotal')}</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('admin.orders.delivery')}</span>
            <span>{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-ember">
            <span>{t('admin.orders.orderTotal')}</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
        {order.attentionReason && (
          <div className="mt-3 rounded-sm border border-destructive/40 p-2 text-destructive">
            {order.attentionReason}
            {order.stockPending && (
              <button
                type="button"
                onClick={onResolveSkip}
                className="mt-1 block text-xs underline"
              >
                {t('admin.orders.resolveWithoutStock')}
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs uppercase tracking-label opacity-60">
          {t('admin.orders.deliverTo')}
        </h3>
        <p>{order.customerName}</p>
        <p className="opacity-80">
          {order.customerPhone}
          {order.customerAltPhone && ` / ${order.customerAltPhone}`}
        </p>
        {order.customerEmail && <p className="opacity-80">{order.customerEmail}</p>}
        <p className="mt-1 opacity-80">
          {order.addressLine}, {order.locality}, {order.city}, {order.state} - {order.pincode}
        </p>
        {order.note && (
          <p className="mt-2 italic opacity-80">
            {t('admin.orders.customerNote')}: {order.note}
          </p>
        )}
        {(shipment.courier || shipment.trackingNumber) && (
          <div className="mt-3">
            <p>
              {shipment.courier}
              {shipment.trackingNumber && ` · ${shipment.trackingNumber}`}
            </p>
            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ember hover:opacity-80"
              >
                {t('admin.orders.trackParcel')}
              </a>
            )}
          </div>
        )}
        {order.paymentStatus === 'paid' &&
          (order.status === 'placed' || order.status === 'packed') && (
            <button type="button" onClick={onUnpay} className="mt-3 text-xs underline opacity-70">
              {t('admin.orders.markUnpaid')}
            </button>
          )}
      </div>

      <div>
        <h3 className="mb-2 text-xs uppercase tracking-label opacity-60">
          {t('admin.orders.timeline')}
        </h3>
        <ul className="space-y-1.5">
          {[
            ...order.statusHistory.map((entry) => ({
              at: entry.at,
              text: `${t(`admin.orders.status.${entry.status}`)}${entry.note ? ` — ${entry.note}` : ''}`,
              by: entry.byEmail,
            })),
            ...order.internalNotes.map((note) => ({
              at: note.at,
              text: note.text,
              by: note.byEmail,
            })),
          ]
            .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
            .map((entry, index) => (
              <li key={index}>
                <span className="opacity-60">{formatDateTime(entry.at)}</span> · {entry.text}
                {entry.by && <span className="text-xs opacity-50"> ({entry.by})</span>}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
