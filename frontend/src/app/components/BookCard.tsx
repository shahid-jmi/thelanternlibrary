import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import type { PublicBook } from '../api/types';
import { formatPrice } from '../lib/format';

export default function BookCard({ book }: { book: PublicBook }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/book/${book._id}`}
      className="group block overflow-hidden rounded-sm border border-border/70 bg-card p-3 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-ember/60 hover:bg-card/80"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-background">
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
        {!book.isAvailable && (
          <span className="absolute left-2 top-2 rounded-sm bg-destructive px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
            {t('admin.dashboard.unavailable')}
          </span>
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] opacity-65">
            {book.genre}
          </span>
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] opacity-65">
            {book.language}
          </span>
        </div>
        <h2 className="mt-2 text-lg leading-snug transition group-hover:text-ember">
          {book.title}
        </h2>
        <p className="mt-1 text-sm italic opacity-75">{book.author}</p>
        <p className="mt-2 text-base">{formatPrice(book.price)}</p>
      </div>
    </Link>
  );
}
