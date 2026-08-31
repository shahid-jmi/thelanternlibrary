import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { BOOK_GENRES, BOOK_LANGUAGES } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useBooks } from '@/app/queries/books';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import BookCard from '@/app/components/BookCard';
import CardSkeleton from '@/app/components/CardSkeleton';
import StatusMessage from '@/app/components/StatusMessage';
import PageFrame from '@/app/components/PageFrame';
import LanternMark from '@/app/components/LanternMark';
import { FilterSelect } from '@/app/components/FormControls';
import { Eyebrow } from '@/app/components/ui';

export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [available, setAvailable] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const booksQuery = useBooks({
    lang: i18n.language,
    search: debouncedSearch,
    genre,
    language,
    available,
  });

  const books = booksQuery.data ?? [];
  const loading = booksQuery.isPending;
  const error = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';

  return (
    <PageFrame>
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-2">The Shelves</Eyebrow>
            <h1 className="text-4xl tracking-snug sm:text-5xl">{t('catalog.title')}</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('catalog.search')}
                className="h-11 w-full min-w-48 rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
              />
            </label>
            <FilterSelect
              label={t('catalog.filter.genre')}
              allLabel={t('catalog.filter.allGenres')}
              value={genre}
              onChange={setGenre}
              values={BOOK_GENRES}
            />
            <FilterSelect
              label={t('catalog.filter.language')}
              allLabel={t('catalog.filter.allLanguages')}
              value={language}
              onChange={setLanguage}
              values={BOOK_LANGUAGES}
            />
            <select
              value={available}
              aria-label={t('catalog.filter.allAvailability')}
              onChange={(event) => setAvailable(event.target.value)}
              className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
            >
              <option value="">{t('catalog.filter.allAvailability')}</option>
              <option value="true">{t('admin.dashboard.available')}</option>
              <option value="false">{t('admin.dashboard.unavailable')}</option>
            </select>
          </div>
        </div>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {!loading && !error && books.length === 0 && (
          <div className="py-16 text-center">
            <LanternMark className="mx-auto mb-6 h-20 w-auto text-accent opacity-70" />
            <p className="italic opacity-70">{t('catalog.noResults')}</p>
          </div>
        )}

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <CardSkeleton key={index} />)
            : books.map((book) => <BookCard key={book._id} book={book} />)}
        </div>
      </section>
    </PageFrame>
  );
}
