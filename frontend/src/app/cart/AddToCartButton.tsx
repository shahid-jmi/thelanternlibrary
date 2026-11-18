import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, ShoppingBag } from 'lucide-react';
import type { ItemType, StockStatus } from '@/app/api/types';
import { cn } from '@/app/lib/cn';
import { useCart, type CartLine } from '@/app/cart/CartContext';

export interface CartableItem extends Omit<CartLine, 'quantity'> {
  isAvailable: boolean;
  stockStatus: StockStatus;
}

export const canBuy = (item: { isAvailable: boolean; stockStatus: StockStatus }) =>
  item.isAvailable && item.stockStatus !== 'out_of_stock';

/** "Only 2 left" / "Out of stock" — nothing for well-stocked or untracked items. */
export function StockLabel({
  stockStatus,
  stockRemaining,
  className,
}: {
  stockStatus: StockStatus;
  stockRemaining: number | null;
  className?: string;
}) {
  const { t } = useTranslation();
  if (stockStatus === 'low_stock' && stockRemaining !== null) {
    return (
      <span className={cn('text-amber-600 dark:text-amber-400', className)}>
        {t('cart.onlyLeft', { count: stockRemaining })}
      </span>
    );
  }
  if (stockStatus === 'out_of_stock') {
    return <span className={cn('text-destructive', className)}>{t('cart.outOfStock')}</span>;
  }
  return null;
}

export default function AddToCartButton({
  item,
  size = 'lg',
  className,
}: {
  item: CartableItem;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const { t } = useTranslation();
  const cart = useCart();
  const inCart = cart.has(item.itemType as ItemType, item.itemId);
  const sizing = size === 'lg' ? 'h-12 px-6 text-base' : 'h-9 px-3 text-xs';

  if (!canBuy(item)) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'inline-flex items-center rounded-sm border border-border opacity-55',
          sizing,
          className
        )}
      >
        {item.isAvailable ? t('cart.outOfStock') : t('book.unavailable')}
      </button>
    );
  }

  if (inCart) {
    return (
      <Link
        to="/cart"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-sm border border-ember text-ember transition hover:bg-ember/10',
          sizing,
          className
        )}
      >
        <Check className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        {t('cart.inCart')}
      </Link>
    );
  }

  const { isAvailable: _isAvailable, stockStatus: _stockStatus, ...line } = item;
  return (
    <button
      type="button"
      onClick={() => cart.add(line)}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm bg-primary text-primary-foreground transition hover:opacity-90',
        sizing,
        className
      )}
    >
      <ShoppingBag className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {t('cart.add')}
    </button>
  );
}
