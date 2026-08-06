import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { useBook } from '../queries/books';
import { formatPrice } from '../lib/format';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import OrderForm from '../components/OrderForm';

export default function OrderPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  const bookQuery = useBook(id, i18n.language);
  const book = bookQuery.data ?? null;
  const error = bookQuery.isError ? getErrorMessage(bookQuery.error) : '';

  if (bookQuery.isPending) {
    return (
      <PageFrame compact>
        <StatusMessage>Loading book...</StatusMessage>
      </PageFrame>
    );
  }

  if (error || !book) {
    return (
      <PageFrame compact>
        <StatusMessage tone="error">{error || 'Book not found'}</StatusMessage>
      </PageFrame>
    );
  }

  return (
    <PageFrame compact>
      <Link
        to={`/book/${book._id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {book.title}
      </Link>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4 rounded-sm border border-border bg-card p-4">
          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
            {book.coverImage?.url ? (
              <img
                src={book.coverImage.url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-60">
                <BookOpen className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg leading-snug">{book.title}</h1>
            <p className="text-sm italic opacity-70">{book.author}</p>
            <p className="mt-1 text-sm text-ember">{formatPrice(book.price)}</p>
          </div>
        </div>
        <OrderForm
          bookId={book._id}
          bookTitle={book.title}
          bookAuthor={book.author}
          priceLabel={formatPrice(book.price)}
          whatsappNumber={whatsappNumber}
          onCancel={() => navigate(`/book/${book._id}`)}
        />
      </div>
    </PageFrame>
  );
}
