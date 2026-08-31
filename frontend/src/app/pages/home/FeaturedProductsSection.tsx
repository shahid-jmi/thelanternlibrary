import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/app/api/client';
import { useProducts } from '@/app/queries/products';
import ProductCard from '@/app/components/ProductCard';
import CardSkeleton from '@/app/components/CardSkeleton';
import StatusMessage from '@/app/components/StatusMessage';
import Reveal from '@/app/components/Reveal';
import { useCarousel } from './useCarousel';

export default function FeaturedProductsSection() {
  const { i18n } = useTranslation();
  const carousel = useCarousel();

  const productsQuery = useProducts({ lang: i18n.language, available: 'true', featured: 'true' });
  const featuredProducts = productsQuery.data ?? [];
  const productsLoading = productsQuery.isPending;
  const productsError = productsQuery.isError ? getErrorMessage(productsQuery.error) : '';

  if (!productsLoading && !productsError && featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl tracking-tight">Featured Products</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => carousel.scrollBy(-1)}
              aria-label="Scroll featured products back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
            >
              ‹
            </button>
            <button
              onClick={() => carousel.scrollBy(1)}
              aria-label="Scroll featured products forward"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
            >
              ›
            </button>
          </div>
        </div>
      </Reveal>
      {productsError && <StatusMessage tone="error">{productsError}</StatusMessage>}
      <div
        ref={carousel.ref}
        onWheel={carousel.onWheel}
        className="no-scrollbar flex snap-x gap-7 overflow-x-auto pb-2"
      >
        {productsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-60 shrink-0 snap-start">
                <CardSkeleton aspect="aspect-[4/5]" />
              </div>
            ))
          : featuredProducts.map((product, index) => (
              <Reveal key={product._id} delay={index * 60} className="w-60 shrink-0 snap-start">
                <ProductCard product={product} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}
