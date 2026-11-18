import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MessageCircle } from 'lucide-react';
import { INDIAN_STATES, type OrderQuote, type PublicOrder } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useCreateOrder } from '@/app/queries/orders';
import { validatePincode, validateRequired } from '@/app/lib/validation';
import { useValidatedField } from '@/app/lib/useValidatedField';
import { FieldInput, FieldSelect, FieldTextArea } from '@/app/components/FormField';
import StatusMessage from '@/app/components/StatusMessage';
import { focusFirstInvalid } from '@/app/lib/scroll';
import { formatPrice } from '@/app/lib/format';
import { useCart } from '@/app/cart/CartContext';

export interface CustomerDetails {
  name: string;
  phone: string;
  altPhone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note: string;
}

export function buildWhatsappMessage(order: PublicOrder, customer: CustomerDetails): string {
  return [
    `Order ${order.orderNumber}`,
    '',
    ...order.items.map(
      (item) =>
        `${item.quantity} × ${item.title}${item.subtitle ? ` (${item.subtitle})` : ''} — ${formatPrice(item.lineTotal)}`
    ),
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}`,
    `Total: ${formatPrice(order.total)}`,
    '',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}${customer.altPhone ? ` / ${customer.altPhone}` : ''}`,
    `Address: ${customer.addressLine}, ${customer.locality}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
    customer.note ? `Note: ${customer.note}` : '',
  ]
    .filter((line, index, all) => line || all[index - 1])
    .join('\n')
    .trim();
}

/**
 * Collects delivery details, places the order for everything in the cart,
 * then hands the customer to WhatsApp to arrange payment. `onStateChange`
 * lets the page re-quote delivery as soon as a state is picked.
 */
export default function CheckoutForm({
  quote,
  whatsappNumber,
  onStateChange,
  onPlaced,
}: {
  quote: OrderQuote | undefined;
  whatsappNumber: string;
  onStateChange: (state: string) => void;
  onPlaced: (order: PublicOrder, whatsappUrl: string) => void;
}) {
  const { t } = useTranslation();
  const cart = useCart();
  const name = useValidatedField(validateRequired);
  const phone = useValidatedField(validateRequired);
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const addressLine = useValidatedField(validateRequired);
  const locality = useValidatedField(validateRequired);
  const city = useValidatedField(validateRequired);
  const state = useValidatedField(validateRequired);
  const pincode = useValidatedField(validatePincode);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const createOrder = useCreateOrder();

  const blocked = !quote || !quote.canOrder;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [
      name.validateNow(),
      phone.validateNow(),
      addressLine.validateNow(),
      locality.validateNow(),
      city.validateNow(),
      state.validateNow(),
      pincode.validateNow(),
    ];
    if (errors.some(Boolean)) {
      focusFirstInvalid(event.currentTarget);
      return;
    }
    if (blocked) return;

    // Open the tab synchronously, in direct response to the click, so
    // browsers don't treat it as a blocked popup once the await below
    // breaks the "user gesture" chain — then redirect it once the message
    // is ready.
    const whatsappWindow = window.open('', '_blank', 'noreferrer');

    setError('');
    try {
      const order = await createOrder.mutateAsync({
        items: cart.toOrderLines(),
        customerName: name.value,
        customerPhone: phone.value,
        customerAltPhone: altPhone.trim() || undefined,
        customerEmail: email.trim() || undefined,
        addressLine: addressLine.value,
        locality: locality.value,
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        note: note.trim() || undefined,
      });

      const message = buildWhatsappMessage(order, {
        name: name.value,
        phone: phone.value,
        altPhone: altPhone.trim(),
        addressLine: addressLine.value,
        locality: locality.value,
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        note: note.trim(),
      });
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      } else {
        window.open(url, '_blank', 'noreferrer');
      }
      cart.clear();
      onPlaced(order, url);
    } catch (requestError) {
      whatsappWindow?.close();
      setError(getErrorMessage(requestError) || t('order.error'));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-sm border border-border bg-card p-6">
      <h2 className="mb-5 text-lg tracking-[0.05em]">{t('order.title')}</h2>

      <FieldInput
        id="order-name"
        label={t('order.name')}
        hint={t('order.nameHint')}
        value={name.value}
        onChange={name.onChange}
        onBlur={name.onBlur}
        error={name.error ? t(name.error) : undefined}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldInput
          id="order-phone"
          label={t('order.phone')}
          value={phone.value}
          onChange={phone.onChange}
          onBlur={phone.onBlur}
          error={phone.error ? t(phone.error) : undefined}
        />
        <FieldInput
          id="order-alt-phone"
          label={t('order.altPhone')}
          value={altPhone}
          onChange={setAltPhone}
        />
      </div>

      <div className="mt-4">
        <FieldInput
          id="order-email"
          type="email"
          label={t('order.email')}
          hint={t('order.emailHint')}
          value={email}
          onChange={setEmail}
        />
      </div>

      <div className="mt-4">
        <FieldTextArea
          id="order-address-line"
          label={t('order.addressLine')}
          hint={t('order.addressLineHint')}
          value={addressLine.value}
          onChange={addressLine.onChange}
          onBlur={addressLine.onBlur}
          error={addressLine.error ? t(addressLine.error) : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldInput
          id="order-locality"
          label={t('order.locality')}
          hint={t('order.localityHint')}
          value={locality.value}
          onChange={locality.onChange}
          onBlur={locality.onBlur}
          error={locality.error ? t(locality.error) : undefined}
        />
        <FieldInput
          id="order-city"
          label={t('order.city')}
          value={city.value}
          onChange={city.onChange}
          onBlur={city.onBlur}
          error={city.error ? t(city.error) : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id="order-state"
          label={t('order.state')}
          value={state.value}
          onChange={(value) => {
            state.onChange(value);
            onStateChange(value);
          }}
          error={state.error ? t(state.error) : undefined}
        >
          <option value="">{t('order.statePlaceholder')}</option>
          {INDIAN_STATES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FieldSelect>
        <FieldInput
          id="order-pincode"
          label={t('order.pincode')}
          hint={t('order.pincodeHint')}
          value={pincode.value}
          onChange={pincode.onChange}
          onBlur={pincode.onBlur}
          error={pincode.error ? t(pincode.error) : undefined}
        />
      </div>

      <div className="mt-4">
        <FieldInput id="order-note" label={t('order.note')} value={note} onChange={setNote} />
      </div>

      <p className="mt-2 text-xs italic opacity-60">{t('checkout.whatsappExplain')}</p>

      {error && (
        <div className="mt-4">
          <StatusMessage tone="error">{error}</StatusMessage>
        </div>
      )}
      <button
        disabled={createOrder.isPending || blocked}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {createOrder.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {t('order.submit')}
      </button>
    </form>
  );
}
