import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/app/api/client';
import { useBooks } from '@/app/queries/books';
import BookCard from '@/app/components/BookCard';
import CardSkeleton from '@/app/components/CardSkeleton';
import StatusMessage from '@/app/components/StatusMessage';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { useCarousel } from './useCarousel';

export default function FeaturedBooksSection() {
  const { t, i18n } = useTranslation();
  const carousel = useCarousel();

  const booksQuery = useBooks({ lang: i18n.language });
  const books = booksQuery.data ?? [];
  const loading = booksQuery.isPending;
  const error = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';
  const featuredBooks = books.filter((book) => book.isAvailable).slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <Eyebrow className="mb-3">i.</Eyebrow>
            <h2 className="text-3xl tracking-tight">Featured Books</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              className="hidden text-xs uppercase tracking-label text-ember transition hover:opacity-75 sm:inline"
            >
              View all →
            </Link>
            <button
              onClick={() => carousel.scrollBy(-1)}
              aria-label="Scroll featured books back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
            >
              ‹
            </button>
            <button
              onClick={() => carousel.scrollBy(1)}
              aria-label="Scroll featured books forward"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
            >
              ›
            </button>
          </div>
        </div>
      </Reveal>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {!loading && !error && featuredBooks.length === 0 && (
        <StatusMessage>{t('catalog.noResults')}</StatusMessage>
      )}
      <div
        ref={carousel.ref}
        onWheel={carousel.onWheel}
        className="no-scrollbar flex snap-x gap-7 overflow-x-auto pb-2"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-60 shrink-0 snap-start">
                <CardSkeleton />
              </div>
            ))
          : featuredBooks.map((book, index) => (
              <Reveal key={book._id} delay={index * 60} className="w-60 shrink-0 snap-start">
                <BookCard book={book} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}
