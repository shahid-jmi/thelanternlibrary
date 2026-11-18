import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import type { PublicOrder } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useOrderQuote, usePublicSettings } from '@/app/queries/orders';
import { formatPrice } from '@/app/lib/format';
import { scrollIntoViewCentered } from '@/app/lib/scroll';
import { WHATSAPP_NUMBER } from '@/app/lib/site';
import PageFrame from '@/app/components/PageFrame';
import StatusMessage from '@/app/components/StatusMessage';
import { useCart } from '@/app/cart/CartContext';
import CheckoutForm from '@/app/cart/CheckoutForm';
import OrderSummary from '@/app/cart/OrderSummary';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const cart = useCart();
  const [state, setState] = useState('');
  const [placed, setPlaced] = useState<{ order: PublicOrder; whatsappUrl: string } | null>(null);
  const quoteQuery = useOrderQuote(cart.toOrderLines(), state || undefined);
  const settingsQuery = usePublicSettings();
  const successRef = useRef<HTMLDivElement>(null);

  // The long form collapses to a short message on success, which can leave a
  // phone scrolled past it — bring the message (and its WhatsApp link) into view.
  useEffect(() => {
    if (placed && successRef.current) scrollIntoViewCentered(successRef.current);
  }, [placed]);

  if (placed) {
    const { order, whatsappUrl } = placed;
    return (
      <PageFrame compact>
        <div
          ref={successRef}
          className="mx-auto max-w-xl rounded-sm border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-ember" />
            <h1 className="text-2xl tracking-[0.05em]">
              {t('checkout.placedTitle', { number: order.orderNumber })}
            </h1>
          </div>
          <p className="mt-3 opacity-80">{t('order.success')}</p>
          <ul className="mt-4 space-y-1 text-sm">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-3">
                <span>
                  {item.quantity} × {item.title}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 border-t border-border pt-2 text-ember">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(order.total)}</span>
            </li>
          </ul>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            {t('checkout.openWhatsapp')}
          </a>
          <Link to="/catalog" className="mt-4 block text-sm opacity-75 hover:opacity-100">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </PageFrame>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <PageFrame compact>
        <StatusMessage>
          {t('cart.emptyText')}{' '}
          <Link to="/catalog" className="text-ember">
            {t('cart.browse')}
          </Link>
        </StatusMessage>
      </PageFrame>
    );
  }

  const quote = quoteQuery.data;

  return (
    <PageFrame>
      <Link
        to="/cart"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('checkout.backToCart')}
      </Link>
      <h1 className="mb-8 text-4xl tracking-[0.05em]">{t('checkout.title')}</h1>

      {quoteQuery.isError && (
        <StatusMessage tone="error">{getErrorMessage(quoteQuery.error)}</StatusMessage>
      )}
      {quote && !quote.canOrder && (
        <StatusMessage tone="error">
          {t('checkout.cartChanged')}{' '}
          <Link to="/cart" className="underline">
            {t('checkout.backToCart')}
          </Link>
        </StatusMessage>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <CheckoutForm
          quote={quote}
          whatsappNumber={WHATSAPP_NUMBER}
          onStateChange={setState}
          onPlaced={(order, whatsappUrl) => setPlaced({ order, whatsappUrl })}
        />
        <div className="lg:sticky lg:top-24">
          <OrderSummary
            quote={quote}
            loading={quoteQuery.isFetching}
            showItems
            processingTime={settingsQuery.data?.processingTime}
          />
        </div>
      </div>
    </PageFrame>
  );
}
