import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  type BookGenre,
  type BookLanguage,
} from '../api/types';
import { getErrorMessage } from '../api/client';
import { useAdminBooks, useSaveBook } from '../queries/books';
import { validatePrice, validateRequired } from '../lib/validation';
import { useValidatedField } from '../lib/useValidatedField';
import PageFrame from '../components/PageFrame';
import StatusMessage from '../components/StatusMessage';
import { FieldInput, FieldSelect, FieldTextArea } from '../components/FormField';
import ImageUploadField from '../components/ImageUploadField';
import { Button } from '../components/ui';

export default function AdminBookFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const booksQuery = useAdminBooks();
  const saveBook = useSaveBook();

  const book = id ? (booksQuery.data?.find((item) => item._id === id) ?? null) : null;

  if (id && booksQuery.isPending) {
    return (
      <PageFrame compact>
        <StatusMessage>Loading book...</StatusMessage>
      </PageFrame>
    );
  }

  if (id && !booksQuery.isPending && !book) {
    return (
      <PageFrame compact>
        <StatusMessage tone="error">{t('admin.form.notFound')}</StatusMessage>
      </PageFrame>
    );
  }

  const titleEn = book?.title.en ?? '';
  const titleUr = book?.title.ur ?? '';
  const author = book?.author ?? '';
  const descEn = book?.description.en ?? '';
  const descUr = book?.description.ur ?? '';
  const price = book ? String(book.price) : '';
  const genre = book?.genre ?? 'fiction';
  const language = book?.language ?? 'english';
  const isAvailable = book?.isAvailable ?? true;

  const goBack = () => navigate('/admin/dashboard?tab=books');

  return (
    <PageFrame compact>
      <Link
        to="/admin/dashboard?tab=books"
        className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.admins.backToDashboard')}
      </Link>
      <h1 className="mb-8 text-3xl tracking-[0.05em]">
        {book ? t('admin.form.editBookHeading') : t('admin.form.addBookHeading')}
      </h1>
      <BookForm
        key={book?._id ?? 'new'}
        initial={{ titleEn, titleUr, author, descEn, descUr, price, genre, language, isAvailable }}
        coverImageUrl={book?.coverImage?.url}
        onCancel={goBack}
        onSave={async (payload, coverImageFile) => {
          await saveBook.mutateAsync({ id: book?._id, payload, coverImageFile });
          goBack();
        }}
      />
    </PageFrame>
  );
}

interface BookFormInitial {
  titleEn: string;
  titleUr: string;
  author: string;
  descEn: string;
  descUr: string;
  price: string;
  genre: BookGenre;
  language: BookLanguage;
  isAvailable: boolean;
}

function BookForm({
  initial,
  coverImageUrl,
  onCancel,
  onSave,
}: {
  initial: BookFormInitial;
  coverImageUrl?: string;
  onCancel: () => void;
  onSave: (
    payload: {
      title: { en: string; ur: string };
      description: { en: string; ur: string };
      author: string;
      price: number;
      genre: BookGenre;
      language: BookLanguage;
      isAvailable: boolean;
    },
    coverImageFile: File | null
  ) => Promise<void>;
}) {
  const { t } = useTranslation();
  const titleEn = useValidatedField(validateRequired, initial.titleEn);
  const [titleUr, setTitleUr] = useState(initial.titleUr);
  const author = useValidatedField(validateRequired, initial.author);
  const descEn = useValidatedField(validateRequired, initial.descEn);
  const [descUr, setDescUr] = useState(initial.descUr);
  const price = useValidatedField(validatePrice, initial.price);
  const [genre, setGenre] = useState<BookGenre>(initial.genre);
  const [language, setLanguage] = useState<BookLanguage>(initial.language);
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable);
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
    <form onSubmit={submit} noValidate className="rounded-sm border border-border bg-card p-6">
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
          existingUrl={coverImageUrl}
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
