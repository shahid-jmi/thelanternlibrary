import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS, type AdminOrder, type PaymentMethod } from '@/app/api/types';
import { formatPrice } from '@/app/lib/format';
import { FieldInput, FieldSelect } from '@/app/components/FormField';
import { Button } from '@/app/components/ui';

function Dialog({
  title,
  intro,
  children,
  confirmLabel,
  confirmTone = 'primary',
  submitting,
  onConfirm,
  onCancel,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
  confirmLabel: string;
  confirmTone?: 'primary' | 'destructive';
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md rounded-sm border border-border bg-popover p-6 text-popover-foreground">
        <h2 className="text-lg tracking-[0.05em]">{title}</h2>
        {intro && <p className="mt-2 text-sm opacity-70">{intro}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 flex gap-3">
          <Button
            variant={confirmTone === 'destructive' ? 'destructive-outline' : 'primary'}
            className="flex-1"
            loading={submitting}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {t('admin.form.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ order, deliveryCharge }: { order: AdminOrder; deliveryCharge: number }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1 rounded-sm border border-border bg-input-background px-3 py-2 text-sm">
      {order.items.map((item) => (
        <div key={`${item.itemType}-${item.itemId}`} className="flex justify-between gap-3">
          <span className="opacity-80">
            {item.quantity} × {item.title}
          </span>
          <span>{formatPrice(item.lineTotal)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t border-border pt-1 opacity-80">
        <span>{t('admin.orders.delivery')}</span>
        <span>{formatPrice(deliveryCharge)}</span>
      </div>
      <div className="flex justify-between gap-3 text-ember">
        <span>{t('admin.orders.orderTotal')}</span>
        <span>{formatPrice(order.subtotal + deliveryCharge)}</span>
      </div>
    </div>
  );
}

export function RecordPaymentDialog({
  order,
  submitting,
  onConfirm,
  onCancel,
}: {
  order: AdminOrder;
  submitting: boolean;
  onConfirm: (input: { method: PaymentMethod; deliveryCharge: number; note: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [deliveryCharge, setDeliveryCharge] = useState(String(order.deliveryCharge));
  const [note, setNote] = useState('');
  const charge = Number(deliveryCharge);
  const chargeInvalid = deliveryCharge.trim() === '' || !Number.isInteger(charge) || charge < 0;

  return (
    <Dialog
      title={t('admin.orders.recordPayment')}
      intro={t('admin.orders.recordPaymentIntro')}
      confirmLabel={t('admin.orders.markPaid')}
      submitting={submitting}
      onCancel={onCancel}
      onConfirm={() => {
        if (chargeInvalid) return;
        onConfirm({ method, deliveryCharge: charge, note: note.trim() });
      }}
    >
      <OrderSummary order={order} deliveryCharge={chargeInvalid ? order.deliveryCharge : charge} />
      <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
        <FieldSelect
          id="payment-method"
          label={t('admin.orders.paymentMethod')}
          value={method}
          onChange={(value) => setMethod(value as PaymentMethod)}
        >
          {PAYMENT_METHODS.map((item) => (
            <option key={item} value={item}>
              {t(`admin.orders.method.${item}`)}
            </option>
          ))}
        </FieldSelect>
        <FieldInput
          id="delivery-charge"
          type="number"
          min="0"
          step="1"
          label={t('admin.orders.deliveryCharge')}
          value={deliveryCharge}
          onChange={setDeliveryCharge}
          error={chargeInvalid ? t('validation.priceInvalid') : undefined}
        />
      </div>
      <FieldInput
        id="payment-note"
        label={t('admin.orders.noteOptional')}
        hint={t('admin.orders.paymentNoteHint')}
        value={note}
        onChange={setNote}
      />
    </Dialog>
  );
}

export function ShipDialog({
  order,
  submitting,
  onConfirm,
  onCancel,
}: {
  order: AdminOrder;
  submitting: boolean;
  onConfirm: (input: { courier: string; trackingNumber: string; trackingUrl: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [courier, setCourier] = useState(order.shipment.courier ?? '');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const courierMissing = !courier.trim();

  return (
    <Dialog
      title={t('admin.orders.shipTitle', { number: order.orderNumber })}
      intro={order.customerEmail ? t('admin.orders.shipIntroEmail') : t('admin.orders.shipIntro')}
      confirmLabel={t('admin.orders.markShipped')}
      submitting={submitting}
      onCancel={onCancel}
      onConfirm={() => {
        setShowErrors(true);
        if (courierMissing) return;
        onConfirm({
          courier: courier.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim(),
        });
      }}
    >
      <FieldInput
        id="ship-courier"
        label={t('admin.orders.courier')}
        hint={t('admin.orders.courierHint')}
        value={courier}
        onChange={setCourier}
        error={showErrors && courierMissing ? t('validation.required') : undefined}
      />
      <FieldInput
        id="ship-tracking-number"
        label={t('admin.orders.trackingNumber')}
        value={trackingNumber}
        onChange={setTrackingNumber}
      />
      <FieldInput
        id="ship-tracking-url"
        label={t('admin.orders.trackingUrl')}
        value={trackingUrl}
        onChange={setTrackingUrl}
      />
    </Dialog>
  );
}

export function ConfirmOrderActionDialog({
  title,
  message,
  confirmLabel,
  destructive,
  submitting,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  submitting: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  return (
    <Dialog
      title={title}
      intro={message}
      confirmLabel={confirmLabel}
      confirmTone={destructive ? 'destructive' : 'primary'}
      submitting={submitting}
      onCancel={onCancel}
      onConfirm={() => onConfirm(note.trim())}
    >
      <FieldInput
        id="order-action-note"
        label={t('admin.orders.noteOptional')}
        value={note}
        onChange={setNote}
      />
    </Dialog>
  );
}
