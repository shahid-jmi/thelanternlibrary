import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Minus, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/app/api/client';
import { useOrderQuote, usePublicSettings } from '@/app/queries/orders';
import { formatPrice } from '@/app/lib/format';
import PageFrame from '@/app/components/PageFrame';
import StatusMessage from '@/app/components/StatusMessage';
import { MAX_LINE_QUANTITY, useCart } from '@/app/cart/CartContext';
import OrderSummary from '@/app/cart/OrderSummary';

export default function CartPage() {
  const { t } = useTranslation();
  const cart = useCart();
  const quoteQuery = useOrderQuote(cart.toOrderLines());
  const settingsQuery = usePublicSettings();
  const quote = cart.lines.length > 0 ? quoteQuery.data : undefined;

  if (cart.lines.length === 0) {
    return (
      <PageFrame compact>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <ShoppingBag className="h-10 w-10 opacity-50" strokeWidth={1.5} />
          <h1 className="text-3xl tracking-[0.05em]">{t('cart.emptyTitle')}</h1>
          <p className="opacity-70">{t('cart.emptyText')}</p>
          <Link
            to="/catalog"
            className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90"
          >
            {t('cart.browse')}
          </Link>
        </div>
      </PageFrame>
    );
  }

  const quoteLine = (itemType: string, itemId: string) =>
    quote?.lines.find((line) => line.itemType === itemType && line.itemId === itemId);

  return (
    <PageFrame>
      <h1 className="mb-8 text-4xl tracking-[0.05em]">{t('cart.title')}</h1>

      {quoteQuery.isError && (
        <StatusMessage tone="error">{getErrorMessage(quoteQuery.error)}</StatusMessage>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <ul className="divide-y divide-border rounded-sm border border-border bg-card">
          {cart.lines.map((line) => {
            const priced = quoteLine(line.itemType, line.itemId);
            const maxQuantity = Math.min(MAX_LINE_QUANTITY, priced?.available ?? MAX_LINE_QUANTITY);
            const unitPrice = priced?.unitPrice ?? line.price;
            const title = priced?.title ?? line.title;
            const href = line.itemType === 'book' ? `/book/${line.itemId}` : null;

            return (
              <li key={`${line.itemType}-${line.itemId}`} className="flex gap-4 p-4">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                  {line.coverImageUrl ? (
                    <img src={line.coverImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center opacity-50">
                      {line.itemType === 'book' ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <Package className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    {href ? (
                      <Link to={href} className="leading-snug hover:text-ember">
                        {title}
                      </Link>
                    ) : (
                      <p className="leading-snug">{title}</p>
                    )}
                    {line.subtitle && (
                      <p className="truncate text-sm italic opacity-70">{line.subtitle}</p>
                    )}
                    <p className="mt-1 text-sm opacity-80">{formatPrice(unitPrice)}</p>
                    {priced?.problem && (
                      <p className="mt-1 text-sm text-destructive">{priced.problem}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div
                      className="inline-flex items-center rounded-sm border border-border"
                      aria-label={t('cart.quantity')}
                    >
                      <button
                        type="button"
                        aria-label={t('cart.decrease')}
                        disabled={line.quantity <= 1}
                        onClick={() =>
                          cart.setQuantity(line.itemType, line.itemId, line.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center transition hover:bg-secondary disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={t('cart.increase')}
                        disabled={line.quantity >= maxQuantity}
                        onClick={() =>
                          cart.setQuantity(line.itemType, line.itemId, line.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center transition hover:bg-secondary disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm">{formatPrice(unitPrice * line.quantity)}</p>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.itemType, line.itemId)}
                      className="inline-flex items-center gap-1 text-xs text-destructive opacity-80 transition hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="space-y-4 lg:sticky lg:top-24">
          <OrderSummary
            quote={quote}
            loading={quoteQuery.isFetching}
            processingTime={settingsQuery.data?.processingTime}
          />
          {quote && !quote.canOrder && (
            <p className="text-sm text-destructive">{t('cart.fixProblems')}</p>
          )}
          {quote?.canOrder ? (
            <Link
              to="/checkout"
              className="flex h-12 w-full items-center justify-center rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90"
            >
              {t('cart.checkout')}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-12 w-full items-center justify-center rounded-sm bg-primary px-6 text-primary-foreground opacity-50"
            >
              {t('cart.checkout')}
            </button>
          )}
          <Link to="/catalog" className="block text-center text-sm opacity-75 hover:opacity-100">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </PageFrame>
  );
}
