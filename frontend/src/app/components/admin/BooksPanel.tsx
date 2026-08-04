import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Edit, Plus, Trash2 } from 'lucide-react';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  type AdminBook,
  type BookGenre,
  type BookLanguage,
  type BookPayload,
} from '../../api/types';
import { getErrorMessage } from '../../api/client';
import {
  useAdminBooks,
  useDeleteBook,
  useSaveBook,
  useToggleAvailability,
} from '../../queries/books';
import { formatPrice } from '../../lib/format';
import { validatePrice, validateRequired } from '../../lib/validation';
import { useValidatedField } from '../../lib/useValidatedField';
import StatusMessage from '../StatusMessage';
import { FieldInput, FieldSelect, FieldTextArea } from '../FormField';
import ImageUploadField from '../ImageUploadField';
import { Badge, Button, Table, TableHead, TableRow, Td, Th } from '../ui';

export default function BooksPanel() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<AdminBook | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');

  const booksQuery = useAdminBooks();
  const saveBook = useSaveBook();
  const deleteBook = useDeleteBook();
  const toggleAvailability = useToggleAvailability();

  const books = booksQuery.data ?? [];
  const loadError = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';
  const error = actionError || loadError;

  const handleSave = async (payload: BookPayload, coverImageFile: File | null) => {
    await saveBook.mutateAsync({ id: editing?._id, payload, coverImageFile });
    setEditing(null);
    setShowForm(false);
  };

  const removeBook = async (book: AdminBook) => {
    if (!window.confirm(`${t('admin.dashboard.delete')} "${book.title.en}"?`)) return;
    try {
      await deleteBook.mutateAsync(book._id);
      setActionError('');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

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
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t('admin.dashboard.addBook')}
        </Button>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {booksQuery.isPending && <StatusMessage>Loading books...</StatusMessage>}

      {showForm && (
        <BookForm
          key={editing?._id ?? 'new'}
          book={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
          onSave={handleSave}
        />
      )}

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(book);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    {t('admin.dashboard.edit')}
                  </Button>
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
    </section>
  );
}

function BookForm({
  book,
  onCancel,
  onSave,
}: {
  book: AdminBook | null;
  onCancel: () => void;
  onSave: (payload: BookPayload, coverImageFile: File | null) => Promise<void>;
}) {
  const { t } = useTranslation();
  const titleEn = useValidatedField(validateRequired, book?.title.en ?? '');
  const [titleUr, setTitleUr] = useState(book?.title.ur ?? '');
  const author = useValidatedField(validateRequired, book?.author ?? '');
  const descEn = useValidatedField(validateRequired, book?.description.en ?? '');
  const [descUr, setDescUr] = useState(book?.description.ur ?? '');
  const price = useValidatedField(validatePrice, book ? String(book.price) : '');
  const [genre, setGenre] = useState<BookGenre>(book?.genre ?? 'fiction');
  const [language, setLanguage] = useState<BookLanguage>(book?.language ?? 'english');
  const [isAvailable, setIsAvailable] = useState(book?.isAvailable ?? true);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = [titleEn.validateNow(), author.validateNow(), descEn.validateNow(), price.validateNow()];
    if (errors.some(Boolean)) return;

    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          title: { en: titleEn.value, ur: titleUr },
          description: { en: descEn.value, ur: descUr },
          author: author.value,
          price: Number(price.value),
          genre,
          language,
          isAvailable,
        },
        coverImageFile
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldInput
          id="book-title-en"
          label={t('admin.form.titleEn')}
          dir="ltr"
          value={titleEn.value}
          onChange={titleEn.onChange}
          onBlur={titleEn.onBlur}
          error={titleEn.error ? t(titleEn.error) : undefined}
        />
        <FieldInput
          id="book-title-ur"
          label={t('admin.form.titleUr')}
          dir="rtl"
          value={titleUr}
          onChange={setTitleUr}
        />
        <FieldInput
          id="book-author"
          label={t('admin.form.author')}
          value={author.value}
          onChange={author.onChange}
          onBlur={author.onBlur}
          error={author.error ? t(author.error) : undefined}
        />
        <FieldTextArea
          id="book-desc-en"
          label={t('admin.form.descEn')}
          dir="ltr"
          value={descEn.value}
          onChange={descEn.onChange}
          onBlur={descEn.onBlur}
          error={descEn.error ? t(descEn.error) : undefined}
        />
        <FieldTextArea
          id="book-desc-ur"
          label={t('admin.form.descUr')}
          dir="rtl"
          value={descUr}
          onChange={setDescUr}
        />
        <FieldInput
          id="book-price"
          type="number"
          min="0"
          step="0.01"
          label={t('admin.form.price')}
          value={price.value}
          onChange={price.onChange}
          onBlur={price.onBlur}
          error={price.error ? t(price.error) : undefined}
        />
        <FieldSelect
          id="book-genre"
          label={t('admin.form.genre')}
          value={genre}
          onChange={(value) => setGenre(value as BookGenre)}
        >
          {BOOK_GENRES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect
          id="book-language"
          label={t('admin.form.language')}
          value={language}
          onChange={(value) => setLanguage(value as BookLanguage)}
        >
          {BOOK_LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FieldSelect>
        <ImageUploadField
          label={t('admin.form.coverImage')}
          file={coverImageFile}
          onFileChange={setCoverImageFile}
          existingUrl={book?.coverImage?.url}
        />
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(event) => setIsAvailable(event.target.checked)}
          />
          {t('admin.dashboard.available')}
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving}>{t('admin.form.save')}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('admin.form.cancel')}
        </Button>
      </div>
    </form>
  );
}
