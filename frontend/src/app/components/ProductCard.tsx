import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import type { PublicProduct } from '@/app/api/types';
import { formatPrice } from '@/app/lib/format';

// TODO: once product detail pages / ordering exist, wrap this in a <Link>
// to the product route (mirroring BookCard -> /book/:id).
export default function ProductCard({ product }: { product: PublicProduct }) {
  const { t } = useTranslation();

  return (
    <div className="block overflow-hidden rounded-sm border border-border/70 bg-card p-2 shadow-[0_1px_2px_rgba(46,26,8,0.06),0_6px_18px_rgba(46,26,8,0.07)] backdrop-blur-md sm:p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-background">
        {product.coverImage?.url ? (
          <img
            src={product.coverImage.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center opacity-60 sm:gap-3 sm:p-6">
            <Package className="h-8 w-8" />
            <span className="line-clamp-3 text-xs sm:text-sm">{product.name}</span>
          </div>
        )}
        {!product.isAvailable && (
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-destructive px-1.5 py-0.5 text-[9px] sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px] uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
            {t('admin.dashboard.unavailable')}
          </span>
        )}
      </div>
      <div className="px-0.5 pb-0.5 pt-3 sm:px-1 sm:pb-1 sm:pt-4">
        <span className="inline-block rounded-full bg-ember px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-ember-foreground sm:px-2.5">
          {product.category.name}
        </span>
        <h2 className="mt-2 line-clamp-2 text-sm leading-snug sm:text-lg">{product.name}</h2>
        <p className="mt-1.5 text-sm sm:mt-2 sm:text-base">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
