import { useTranslation } from 'react-i18next';
import type { OrderQuote } from '@/app/api/types';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/cn';

/**
 * Subtotal / delivery / total box. Without a delivery state the charge
 * shows as "calculated at checkout".
 */
export default function OrderSummary({
  quote,
  loading,
  showItems = false,
  processingTime,
}: {
  quote: OrderQuote | undefined;
  loading: boolean;
  showItems?: boolean;
  processingTime?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('rounded-sm border border-border bg-card p-5 text-sm', loading && 'opacity-70')}
    >
      <h2 className="mb-4 text-lg tracking-[0.05em]">{t('cart.summary')}</h2>

      {showItems && quote && (
        <ul className="mb-4 space-y-2 border-b border-border pb-4">
          {quote.lines.map((line) => (
            <li key={`${line.itemType}-${line.itemId}`} className="flex justify-between gap-3">
              <span className={cn(line.problem && 'text-destructive line-through')}>
                {line.quantity} × {line.title}
              </span>
              <span className="shrink-0">{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="opacity-75">{t('cart.subtotal')}</span>
          <span>{quote ? formatPrice(quote.subtotal) : '—'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="opacity-75">{t('cart.delivery')}</span>
          <span className="text-right">
            {quote?.deliveryCharge === null || quote?.deliveryCharge === undefined
              ? t('cart.deliveryAtCheckout')
              : quote.deliveryCharge === 0
                ? t('cart.free')
                : formatPrice(quote.deliveryCharge)}
          </span>
        </div>
        {quote?.freeDeliveryRemaining ? (
          <p className="text-xs text-ember">
            {t('cart.freeDeliveryHint', { amount: formatPrice(quote.freeDeliveryRemaining) })}
          </p>
        ) : null}
        <div className="flex justify-between border-t border-border pt-3 text-base">
          <span>{t('cart.total')}</span>
          <span className="text-ember">
            {quote ? formatPrice(quote.total ?? quote.subtotal) : '—'}
          </span>
        </div>
        {quote?.deliveryEstimate && (
          <p className="text-xs opacity-60">
            {t('cart.deliveryEstimate', { estimate: quote.deliveryEstimate })}
          </p>
        )}
        {processingTime && <p className="text-xs opacity-60">{processingTime}</p>}
      </div>
    </div>
  );
}
