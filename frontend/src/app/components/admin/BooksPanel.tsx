import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, Edit, Plus, Trash2 } from 'lucide-react';
import type { AdminBook } from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useAdminBooks, useDeleteBook, useToggleAvailability } from '@/app/queries/books';
import { formatPrice } from '@/app/lib/format';
import { useConfirm } from '@/app/lib/useConfirm';
import { useConfirmedDelete } from '@/app/lib/useConfirmedDelete';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';

export default function BooksPanel() {
  const { t } = useTranslation();
  const [actionError, setActionError] = useState('');
  const { confirm, dialog } = useConfirm();

  const booksQuery = useAdminBooks();
  const deleteBook = useDeleteBook();
  const toggleAvailability = useToggleAvailability();

  const books = booksQuery.data ?? [];
  const loadError = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';
  const error = actionError || loadError;

  const confirmedDelete = useConfirmedDelete(deleteBook, confirm, setActionError);
  const removeBook = (book: AdminBook) =>
    confirmedDelete(book._id, `${t('admin.dashboard.delete')} "${book.title.en}"?`);

  const flipAvailability = async (book: AdminBook) => {
    try {
      await toggleAvailability.mutateAsync({ id: book._id, isAvailable: !book.isAvailable });
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  return (
    <section>
      <div className="mb-6 flex justify-end">
        <Link
          to="/admin/books/new"
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-5 text-sm text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('admin.dashboard.addBook')}
        </Link>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {booksQuery.isPending && <Loader label="Loading books..." />}

      <Table>
        <TableHead>
          <tr>
            <Th>Title</Th>
            <Th>{t('book.author')}</Th>
            <Th>{t('book.price')}</Th>
            <Th>{t('book.genre')}</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </TableHead>
        <tbody>
          {books.map((book) => (
            <TableRow key={book._id}>
              <Td>{book.title.en}</Td>
              <Td>{book.author}</Td>
              <Td>{formatPrice(book.price)}</Td>
              <Td>{book.genre}</Td>
              <Td>
                <button onClick={() => flipAvailability(book)}>
                  <Badge active={book.isAvailable} className="inline-flex items-center gap-2">
                    {book.isAvailable && <Check className="h-3.5 w-3.5" />}
                    {book.isAvailable
                      ? t('admin.dashboard.available')
                      : t('admin.dashboard.unavailable')}
                  </Badge>
                </button>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/books/${book._id}/edit`}
                    className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm transition hover:bg-secondary"
                  >
                    <Edit className="h-4 w-4" />
                    {t('admin.dashboard.edit')}
                  </Link>
                  <Button variant="destructive-outline" size="sm" onClick={() => removeBook(book)}>
                    <Trash2 className="h-4 w-4" />
                    {t('admin.dashboard.delete')}
                  </Button>
                </div>
              </Td>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {dialog}
    </section>
  );
}
