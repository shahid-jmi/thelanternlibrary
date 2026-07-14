import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, Edit, LogOut, Plus, Trash2, Users } from 'lucide-react';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  type AdminBook,
  type BookGenre,
  type BookLanguage,
  type BookPayload,
} from '../api/types';
import { getErrorMessage } from '../api/client';
import { useAdminBooks, useDeleteBook, useSaveBook, useToggleAvailability } from '../queries/books';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../lib/format';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import { SelectInput, TextArea, TextInput } from '../components/FormControls';

const emptyPayload: BookPayload = {
  title: { en: '', ur: '' },
  description: { en: '', ur: '' },
  author: '',
  price: 0,
  genre: 'fiction',
  language: 'english',
  isAvailable: true,
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { isSuperAdmin, logout } = useAuth();
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
    <PageFrame>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl tracking-[0.05em]">{t('admin.dashboard.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            {t('admin.dashboard.addBook')}
          </button>
          {isSuperAdmin && (
            <Link
              to="/admin/admins"
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
            >
              <Users className="h-4 w-4" />
              {t('admin.nav.manageAdmins')}
            </Link>
          )}
          <button
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {booksQuery.isPending && <StatusMessage>Loading books...</StatusMessage>}

      {showForm && (
        <BookForm
          book={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
          onSave={handleSave}
        />
      )}

      <div className="overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm rtl:text-right">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">{t('book.author')}</th>
              <th className="px-4 py-3">{t('book.price')}</th>
              <th className="px-4 py-3">{t('book.genre')}</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3">{book.title.en}</td>
                <td className="px-4 py-3">{book.author}</td>
                <td className="px-4 py-3">{formatPrice(book.price)}</td>
                <td className="px-4 py-3">{book.genre}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => flipAvailability(book)}
                    className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5"
                  >
                    {book.isAvailable && <Check className="h-3.5 w-3.5" />}
                    {book.isAvailable
                      ? t('admin.dashboard.available')
                      : t('admin.dashboard.unavailable')}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(book);
                        setShowForm(true);
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3"
                    >
                      <Edit className="h-4 w-4" />
                      {t('admin.dashboard.edit')}
                    </button>
                    <button
                      onClick={() => removeBook(book)}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.dashboard.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageFrame>
  );
}

function bookToPayload(book: AdminBook | null): BookPayload {
  if (!book) return emptyPayload;
  return {
    title: {
      en: book.title.en || '',
      ur: book.title.ur || '',
    },
    description: {
      en: book.description.en || '',
      ur: book.description.ur || '',
    },
    author: book.author || '',
    price: book.price || 0,
    genre: book.genre,
    language: book.language,
    isAvailable: book.isAvailable,
  };
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
  const [form, setForm] = useState<BookPayload>(() => bookToPayload(book));
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(bookToPayload(book));
    setCoverImageFile(null);
  }, [book]);

  const setField = (field: keyof BookPayload, value: string | number | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setNested = (group: 'title' | 'description', field: 'en' | 'ur', value: string) => {
    setForm((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          ...form,
          price: Number(form.price),
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
    <form onSubmit={submit} className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label={t('admin.form.titleEn')}
          value={form.title.en}
          onChange={(value) => setNested('title', 'en', value)}
          dir="ltr"
          required
        />
        <TextInput
          label={t('admin.form.titleUr')}
          value={form.title.ur || ''}
          onChange={(value) => setNested('title', 'ur', value)}
          dir="rtl"
        />
        <TextInput
          label={t('admin.form.author')}
          value={form.author}
          onChange={(value) => setField('author', value)}
          required
        />
        <TextArea
          label={t('admin.form.descEn')}
          value={form.description.en}
          onChange={(value) => setNested('description', 'en', value)}
          dir="ltr"
          required
        />
        <TextArea
          label={t('admin.form.descUr')}
          value={form.description.ur || ''}
          onChange={(value) => setNested('description', 'ur', value)}
          dir="rtl"
        />
        <label className="block text-sm">
          {t('admin.form.price')}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setField('price', Number(event.target.value))}
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
            required
          />
        </label>
        <SelectInput
          label={t('admin.form.genre')}
          value={form.genre}
          onChange={(value) => setField('genre', value as BookGenre)}
          values={BOOK_GENRES}
        />
        <SelectInput
          label={t('admin.form.language')}
          value={form.language}
          onChange={(value) => setField('language', value as BookLanguage)}
          values={BOOK_LANGUAGES}
        />
        <label className="block text-sm">
          {t('admin.form.coverImage')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          {book?.coverImage?.url && !coverImageFile && (
            <img
              src={book.coverImage.url}
              alt=""
              className="mt-2 h-24 w-16 rounded-sm border border-border object-cover"
            />
          )}
        </label>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(event) => setField('isAvailable', event.target.checked)}
          />
          {t('admin.dashboard.available')}
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button
          disabled={saving}
          className="h-10 rounded-sm bg-primary px-5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {t('admin.form.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-sm border border-border px-5 text-sm"
        >
          {t('admin.form.cancel')}
        </button>
      </div>
    </form>
  );
}
