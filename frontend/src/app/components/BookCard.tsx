import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import type { PublicBook } from '../api/types';
import { formatPrice } from '../lib/format';

export default function BookCard({ book }: { book: PublicBook }) {
  const { t } = useTranslation();

  return (
    <Link to={`/book/${book._id}`} className="group block">
      <div className="mb-4 aspect-[2/3] overflow-hidden rounded-sm border border-border bg-card">
        {book.coverImage?.url ? (
          <img
            src={book.coverImage.url}
            alt={book.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center opacity-60">
            <BookOpen className="h-8 w-8" />
            <span className="text-sm">{book.title}</span>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-snug transition group-hover:opacity-70">{book.title}</h2>
        {!book.isAvailable && (
          <span className="shrink-0 rounded-sm border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
            {t('admin.dashboard.unavailable')}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm italic opacity-75">{book.author}</p>
      <p className="mt-2 text-base">{formatPrice(book.price)}</p>
    </Link>
  );
}
