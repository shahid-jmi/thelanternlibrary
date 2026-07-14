import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, MessageCircle } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { useBook } from '../queries/books';
import { formatPrice } from '../lib/format';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';

export default function BookDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  const bookQuery = useBook(id, i18n.language);
  const book = bookQuery.data ?? null;
  const error = bookQuery.isError ? getErrorMessage(bookQuery.error) : '';

  const whatsappUrl = useMemo(() => {
    if (!book) return '';
    const message = `I would like to order: ${book.title} by ${book.author} - Price: ${book.price}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [book, whatsappNumber]);

  if (bookQuery.isPending) {
    return (
      <PageFrame>
        <StatusMessage>Loading book...</StatusMessage>
      </PageFrame>
    );
  }

  if (error || !book) {
    return (
      <PageFrame>
        <StatusMessage tone="error">{error || 'Book not found'}</StatusMessage>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('book.backToCatalog')}
      </Link>
      <section className="grid gap-10 lg:grid-cols-[minmax(260px,420px),1fr]">
        <div className="aspect-[2/3] overflow-hidden rounded-sm border border-border bg-card">
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center opacity-60">
              <BookOpen className="h-12 w-12" />
              <span className="text-xl">{book.title}</span>
            </div>
          )}
        </div>
        <div className="py-2">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-muted">{book.genre}</p>
          <h1 className="mb-4 text-4xl leading-tight tracking-[0.04em] sm:text-5xl">
            {book.title}
          </h1>
          <p className="mb-8 text-xl italic opacity-75">{book.author}</p>
          <p className="mb-8 max-w-2xl text-base leading-8 opacity-85">{book.description}</p>
          <dl className="mb-8 grid gap-4 sm:grid-cols-2">
            <Info label={t('book.price')} value={formatPrice(book.price)} />
            <Info label={t('book.author')} value={book.author} />
            <Info label={t('book.genre')} value={book.genre} />
            <Info label={t('book.language')} value={book.language} />
          </dl>
          {book.isAvailable ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              {t('book.orderNow')}
            </a>
          ) : (
            <button
              disabled
              className="inline-flex h-12 items-center rounded-sm border border-border px-6 opacity-55"
            >
              {t('book.unavailable')}
            </button>
          )}
        </div>
      </section>
    </PageFrame>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <dt className="mb-1 text-xs uppercase tracking-[0.18em] opacity-55">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
