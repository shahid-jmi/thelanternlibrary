import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import type { PublicProduct } from '@/app/api/types';
import { formatPrice } from '@/app/lib/format';

// TODO: once product detail pages / ordering exist, wrap this in a <Link>
// to the product route (mirroring BookCard -> /book/:id).
export default function ProductCard({ product }: { product: PublicProduct }) {
  const { t } = useTranslation();

  return (
    <div className="block overflow-hidden rounded-sm border border-border/70 bg-card p-3 backdrop-blur-md">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-background">
        {product.coverImage?.url ? (
          <img
            src={product.coverImage.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center opacity-60">
            <Package className="h-8 w-8" />
            <span className="text-sm">{product.name}</span>
          </div>
        )}
        {!product.isAvailable && (
          <span className="absolute left-2 top-2 rounded-sm bg-destructive px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
            {t('admin.dashboard.unavailable')}
          </span>
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] opacity-65">
          {product.category.name}
        </span>
        <h2 className="mt-2 text-lg leading-snug">{product.name}</h2>
        <p className="mt-2 text-base">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
