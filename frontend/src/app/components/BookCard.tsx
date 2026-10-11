import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import type { PublicBook } from '@/app/api/types';
import { formatPrice } from '@/app/lib/format';

export default function BookCard({ book }: { book: PublicBook }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/book/${book._id}`}
      className="group block overflow-hidden rounded-sm border border-border/70 bg-card p-2 backdrop-blur-md sm:p-3 transition duration-300 hover:-translate-y-1 hover:border-ember/60 hover:bg-card/80"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-background">
        {book.coverImage?.url ? (
          <img
            src={book.coverImage.url}
            alt={book.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center opacity-60 sm:gap-3 sm:p-6">
            <BookOpen className="h-8 w-8" />
            <span className="line-clamp-3 text-xs sm:text-sm">{book.title}</span>
          </div>
        )}
        {!book.isAvailable && (
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-destructive px-1.5 py-0.5 text-[9px] sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px] uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
            {t('admin.dashboard.unavailable')}
          </span>
        )}
      </div>
      <div className="px-0.5 pb-0.5 pt-3 sm:px-1 sm:pb-1 sm:pt-4">
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] opacity-65">
            {book.genre}
          </span>
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] opacity-65">
            {book.language}
          </span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-sm leading-snug sm:text-lg transition group-hover:text-ember">
          {book.title}
        </h2>
        <p className="mt-1 truncate text-xs italic opacity-75 sm:text-sm">{book.author}</p>
        <p className="mt-1.5 text-sm sm:mt-2 sm:text-base">{formatPrice(book.price)}</p>
      </div>
    </Link>
  );
}
