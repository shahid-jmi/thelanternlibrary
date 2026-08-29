import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Loader2, MessageCircle } from 'lucide-react';
import { INDIAN_STATES } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useCreateOrder } from '@/app/queries/orders';
import { validatePincode, validateRequired } from '@/app/lib/validation';
import { useValidatedField } from '@/app/lib/useValidatedField';
import { FieldInput, FieldSelect, FieldTextArea } from '@/app/components/FormField';
import StatusMessage from '@/app/components/StatusMessage';

export default function OrderForm({
  bookId,
  bookTitle,
  bookAuthor,
  priceLabel,
  whatsappNumber,
  onCancel,
}: {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  priceLabel: string;
  whatsappNumber: string;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const name = useValidatedField(validateRequired);
  const phone = useValidatedField(validateRequired);
  const [altPhone, setAltPhone] = useState('');
  const addressLine = useValidatedField(validateRequired);
  const locality = useValidatedField(validateRequired);
  const city = useValidatedField(validateRequired);
  const state = useValidatedField(validateRequired);
  const pincode = useValidatedField(validatePincode);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const createOrder = useCreateOrder();

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
    if (errors.some(Boolean)) return;

    // Open the tab synchronously, in direct response to the click, so
    // browsers don't treat it as a blocked popup once the await below
    // breaks the "user gesture" chain — then redirect it once the message
    // is ready.
    const whatsappWindow = window.open('', '_blank', 'noreferrer');

    setError('');
    try {
      await createOrder.mutateAsync({
        book: bookId,
        customerName: name.value,
        customerPhone: phone.value,
        customerAltPhone: altPhone.trim() || undefined,
        addressLine: addressLine.value,
        locality: locality.value,
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        note: note.trim() || undefined,
      });

      const message = [
        `I would like to order: ${bookTitle} by ${bookAuthor} - Price: ${priceLabel}`,
        '',
        `Name: ${name.value}`,
        `Phone: ${phone.value}${altPhone.trim() ? ` / ${altPhone.trim()}` : ''}`,
        `Address: ${addressLine.value}, ${locality.value}, ${city.value}, ${state.value} - ${pincode.value}`,
        note.trim() ? `Note: ${note.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      } else {
        window.open(url, '_blank', 'noreferrer');
      }
      setWhatsappUrl(url);
    } catch (requestError) {
      whatsappWindow?.close();
      setError(getErrorMessage(requestError) || t('order.error'));
    }
  };

  if (whatsappUrl) {
    return (
      <div className="mt-6">
        <StatusMessage>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('order.success')}</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ember transition hover:opacity-80"
            >
              <ExternalLink className="h-4 w-4" />
              {t('book.orderNow')}
            </a>
          </div>
        </StatusMessage>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-6 rounded-sm border border-border bg-card p-6"
    >
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
          onChange={state.onChange}
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

      {error && (
        <div className="mt-4">
          <StatusMessage tone="error">{error}</StatusMessage>
        </div>
      )}
      <div className="mt-5 flex gap-3">
        <button
          disabled={createOrder.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {createOrder.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          {t('order.submit')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-sm border border-border px-6 text-sm"
        >
          {t('admin.form.cancel')}
        </button>
      </div>
    </form>
  );
}
