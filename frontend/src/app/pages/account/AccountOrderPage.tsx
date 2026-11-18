import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Check, Download, ExternalLink, Package } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { downloadMyReceipt, getMyOrder } from '@/app/api/customer';
import type { OrderStatus } from '@/app/api/types';
import { customerKeys } from '@/app/auth/CustomerContext';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/cn';
import PageFrame from '@/app/components/PageFrame';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Button } from '@/app/components/ui';

const PROGRESS: OrderStatus[] = ['placed', 'packed', 'shipped', 'delivered'];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function AccountOrderPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const [receiptError, setReceiptError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const orderQuery = useQuery({ queryKey: customerKeys.order(id), queryFn: () => getMyOrder(id) });

  if (orderQuery.isPending) {
    return (
      <PageFrame compact>
        <Loader />
      </PageFrame>
    );
  }
  if (orderQuery.isError) {
    return (
      <PageFrame compact>
        <StatusMessage tone="error">{getErrorMessage(orderQuery.error)}</StatusMessage>
      </PageFrame>
    );
  }

  const order = orderQuery.data;
  const reachedAt = (status: OrderStatus) =>
    order.timeline.filter((entry) => entry.status === status).at(-1)?.at;
  const stoppedEarly = order.status === 'cancelled' || order.status === 'returned';
  const currentIndex = PROGRESS.indexOf(order.status);

  const getReceipt = async () => {
    setDownloading(true);
    setReceiptError('');
    try {
      const blob = await downloadMyReceipt(order._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setReceiptError(getErrorMessage(requestError));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageFrame>
      <Link
        to="/account"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('account.backToOrders')}
      </Link>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl tracking-[0.05em]">
            {t('account.orderTitle', { number: order.orderNumber })}
          </h1>
          <p className="mt-1 text-sm opacity-70">
            {t('account.placedOn', { date: formatDate(order.createdAt) })}
          </p>
        </div>
        {order.receiptAvailable && (
          <Button variant="outline" loading={downloading} onClick={getReceipt}>
            <Download className="h-4 w-4" />
            {t('account.downloadReceipt')}
          </Button>
        )}
      </div>
      {receiptError && <StatusMessage tone="error">{receiptError}</StatusMessage>}

      {/* Progress */}
      <div className="mb-8 rounded-sm border border-border bg-card p-6">
        {stoppedEarly ? (
          <p className="text-destructive">{t(`account.orderStatus.${order.status}`)}</p>
        ) : (
          <ol className="grid grid-cols-4 gap-2">
            {PROGRESS.map((status, index) => {
              const done = index <= currentIndex;
              const at = reachedAt(status);
              return (
                <li
                  key={status}
                  className="flex flex-col items-center text-center text-xs sm:text-sm"
                >
                  <span
                    className={cn(
                      'mb-2 flex h-8 w-8 items-center justify-center rounded-full border',
                      done
                        ? 'border-ember bg-ember text-ember-foreground'
                        : 'border-border opacity-50'
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={done ? '' : 'opacity-50'}>
                    {t(`account.orderStatus.${status}`)}
                  </span>
                  {at && <span className="text-[11px] opacity-60">{formatDate(at)}</span>}
                </li>
              );
            })}
          </ol>
        )}
        {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
          <p className="mt-5 text-sm opacity-80">{t('account.awaitingPayment')}</p>
        )}
        {order.shipment.courier && (
          <div className="mt-5 border-t border-border pt-4 text-sm">
            <p>
              {t('account.shippedWith', { courier: order.shipment.courier })}
              {order.shipment.trackingNumber &&
                ` · ${t('account.trackingNumber')}: ${order.shipment.trackingNumber}`}
            </p>
            {order.shipment.trackingUrl && (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-ember hover:opacity-80"
              >
                <ExternalLink className="h-4 w-4" />
                {t('admin.orders.trackParcel')}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border rounded-sm border border-border bg-card">
          {order.items.map((item) => (
            <li key={`${item.itemType}-${item.itemId}`} className="flex gap-4 p-4">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center opacity-50">
                    {item.itemType === 'book' ? (
                      <BookOpen className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-1 justify-between gap-4">
                <div>
                  <p>{item.title}</p>
                  {item.subtitle && <p className="text-sm italic opacity-70">{item.subtitle}</p>}
                  <p className="text-sm opacity-70">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p>{formatPrice(item.lineTotal)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <div className="rounded-sm border border-border bg-card p-5 text-sm">
            <div className="flex justify-between">
              <span className="opacity-75">{t('cart.subtotal')}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="opacity-75">{t('cart.delivery')}</span>
              <span>
                {order.deliveryCharge === 0 ? t('cart.free') : formatPrice(order.deliveryCharge)}
              </span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base">
              <span>{t('cart.total')}</span>
              <span className="text-ember">{formatPrice(order.total)}</span>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-card p-5 text-sm">
            <h2 className="mb-2 text-xs uppercase tracking-label opacity-60">
              {t('admin.orders.deliverTo')}
            </h2>
            <p>{order.customerName}</p>
            <p className="opacity-80">{order.customerPhone}</p>
            <p className="opacity-80">
              {order.addressLine}, {order.locality}, {order.city}, {order.state} - {order.pincode}
            </p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
