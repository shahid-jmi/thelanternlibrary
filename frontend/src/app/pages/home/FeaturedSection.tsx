import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/app/api/client';
import { useBooks } from '@/app/queries/books';
import { useProducts } from '@/app/queries/products';
import BookCard from '@/app/components/BookCard';
import ProductCard from '@/app/components/ProductCard';
import CardSkeleton from '@/app/components/CardSkeleton';
import StatusMessage from '@/app/components/StatusMessage';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { useCarousel } from './useCarousel';

const CARD_WIDTH = 'w-40 shrink-0 snap-start sm:w-48 lg:w-52';

const ARROW_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-full border border-[var(--button-border)] transition hover:border-ember hover:text-ember disabled:pointer-events-none disabled:opacity-30';

/**
 * One labelled shelf inside the featured section: a small caps label with a
 * hairline running to the right, then a horizontal card row. Arrows only
 * appear when the row actually overflows.
 */
function FeaturedRow({
  label,
  action,
  loading,
  itemCount,
  skeletonAspect,
  children,
}: {
  label: string;
  action?: ReactNode;
  loading: boolean;
  /** Re-measures overflow when the cards arrive. */
  itemCount: number;
  skeletonAspect: string;
  children: ReactNode;
}) {
  const carousel = useCarousel(loading ? -1 : itemCount);

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <h3 className="shrink-0 text-xs uppercase tracking-widest opacity-80">{label}</h3>
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
        {action}
        {carousel.overflowing && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => carousel.scrollBy(-1)}
              disabled={carousel.atStart}
              aria-label={`Scroll ${label.toLowerCase()} back`}
              className={ARROW_CLASS}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => carousel.scrollBy(1)}
              disabled={carousel.atEnd}
              aria-label={`Scroll ${label.toLowerCase()} forward`}
              className={ARROW_CLASS}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div
        ref={carousel.ref}
        onWheel={carousel.onWheel}
        className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 sm:gap-5"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={CARD_WIDTH}>
                <CardSkeleton aspect={skeletonAspect} />
              </div>
            ))
          : children}
      </div>
    </div>
  );
}

/**
 * Featured books and featured products under one heading, as two tight
 * labelled rows. Replaces two stacked sections that each had their own
 * heading, padding and a divider between them.
 */
export default function FeaturedSection() {
  const { i18n } = useTranslation();

  const booksQuery = useBooks({ lang: i18n.language, available: 'true', featured: 'true' });
  const productsQuery = useProducts({ lang: i18n.language, available: 'true', featured: 'true' });
  const books = booksQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const booksError = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';
  const productsError = productsQuery.isError ? getErrorMessage(productsQuery.error) : '';

  // Hide a row once we know it has nothing to show; keep it while loading
  // (skeletons) or when it errored (so the error is visible).
  const showBooks = booksQuery.isPending || !!booksError || books.length > 0;
  const showProducts = productsQuery.isPending || !!productsError || products.length > 0;

  if (!showBooks && !showProducts) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-10">
          <Eyebrow className="mb-3">ii.</Eyebrow>
          <h2 className="text-3xl tracking-tight">From the Shelf</h2>
          <p className="mt-2 italic opacity-70">A few things we're especially fond of.</p>
        </div>
      </Reveal>

      <div className="space-y-12">
        {showBooks && (
          <FeaturedRow
            label="Books"
            loading={booksQuery.isPending}
            itemCount={books.length}
            skeletonAspect="aspect-[2/3]"
            action={
              <Link
                to="/catalog"
                className="shrink-0 text-xs uppercase tracking-label text-ember transition hover:opacity-75"
              >
                View all →
              </Link>
            }
          >
            {booksError ? (
              <StatusMessage tone="error">{booksError}</StatusMessage>
            ) : (
              books.map((book, index) => (
                <Reveal key={book._id} delay={(index % 6) * 60} className={CARD_WIDTH}>
                  <BookCard book={book} />
                </Reveal>
              ))
            )}
          </FeaturedRow>
        )}

        {showProducts && (
          <FeaturedRow
            label="Keepsakes"
            loading={productsQuery.isPending}
            itemCount={products.length}
            skeletonAspect="aspect-[4/5]"
          >
            {productsError ? (
              <StatusMessage tone="error">{productsError}</StatusMessage>
            ) : (
              products.map((product, index) => (
                <Reveal key={product._id} delay={(index % 6) * 60} className={CARD_WIDTH}>
                  <ProductCard product={product} />
                </Reveal>
              ))
            )}
          </FeaturedRow>
        )}
      </div>
    </section>
  );
}
