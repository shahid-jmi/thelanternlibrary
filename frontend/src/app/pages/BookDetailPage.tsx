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

  const bookQuery = useBook(id, i18n.language);
  const book = bookQuery.data ?? null;
  const error = bookQuery.isError ? getErrorMessage(bookQuery.error) : '';

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
        to="/catalog"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('book.backToCatalog')}
      </Link>
      <section className="grid gap-12 lg:grid-cols-[minmax(220px,300px)_1fr] lg:items-start">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-sm border border-border/70 bg-card p-3 backdrop-blur-md lg:max-w-none">
          <div className="h-full w-full overflow-hidden rounded-sm bg-background">
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
          {!book.isAvailable && (
            <span className="absolute left-5 top-5 rounded-sm bg-destructive px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
              {t('book.unavailable')}
            </span>
          )}
        </div>

        <div className="py-2">
          <p className="mb-4 text-[10px] uppercase tracking-widest text-accent">
            · {book.genre} ·
          </p>
          <h1 className="mb-4 text-4xl leading-tight tracking-[0.04em] sm:text-5xl">
            {book.title}
          </h1>
          <p className="mb-1 text-xl italic opacity-75">{book.author}</p>
          <p className="mb-8 text-xs uppercase tracking-label opacity-50">{book.language}</p>

          <p className="mb-10 max-w-2xl text-base leading-8 opacity-85">{book.description}</p>

          <div className="mb-10 h-px max-w-xs bg-border" />

          <div className="flex flex-wrap items-center gap-8">
            <p className="text-3xl tracking-[0.04em] text-ember">{formatPrice(book.price)}</p>
            {book.isAvailable ? (
              <Link
                to={`/book/${book._id}/order`}
                className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
                {t('book.orderNow')}
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex h-12 items-center rounded-sm border border-border px-6 opacity-55"
              >
                {t('book.unavailable')}
              </button>
            )}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
