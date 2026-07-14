import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Instagram, Mail, MapPin, MessageCircle, Search } from 'lucide-react';
import { BOOK_GENRES, BOOK_LANGUAGES } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useBooks } from '../queries/books';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import BookCard from '../components/BookCard';
import Divider from '../components/Divider';
import StatusMessage from '../components/StatusMessage';
import { FilterSelect } from '../components/FormControls';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [available, setAvailable] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const booksQuery = useBooks({
    lang: i18n.language,
    search: debouncedSearch,
    genre,
    language,
    available,
  });

  const books = booksQuery.data ?? [];
  const loading = booksQuery.isPending;
  const error = booksQuery.isError ? getErrorMessage(booksQuery.error) : '';
  const featuredBooks = books.slice(0, 4);

  return (
    <main id="home">
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <h1 className="mb-6 text-5xl leading-tight tracking-[0.08em] sm:text-6xl">
          Lantern Library
        </h1>
        <p className="mb-8 text-sm italic tracking-[0.08em] opacity-75">
          Illuminating minds, one book at a time
        </p>
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 opacity-85">
          A curated collection of timeless literature and contemporary thought. Each book is chosen
          with care for readers who seek depth, beauty, and meaning in the written word.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#catalog"
            className="rounded-sm border border-[var(--button-border)] px-8 py-3 text-xs uppercase tracking-[0.18em] transition hover:bg-secondary"
          >
            Browse Catalog
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3 text-xs uppercase tracking-[0.18em] transition hover:bg-secondary"
          >
            <MessageCircle className="h-4 w-4" />
            Order Directly
          </a>
        </div>
      </section>

      <Divider />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl tracking-[0.04em]">What We Offer</h2>
        <div className="grid gap-10 md:grid-cols-3">
          <Feature icon={<BookOpen className="h-6 w-6" />} title="Curated Selection">
            Every book is handpicked for its quality, relevance, and ability to spark meaningful
            thought.
          </Feature>
          <Feature icon={<MessageCircle className="h-6 w-6" />} title="Personal Service">
            Order directly through WhatsApp for a simple, personal experience and quick responses.
          </Feature>
          <Feature icon={<Mail className="h-6 w-6" />} title="Reliable Delivery">
            We make sure your books reach you safely, with care taken in every step of the process.
          </Feature>
        </div>
      </section>

      <Divider />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-3xl tracking-[0.04em]">Featured Books</h2>
          <a href="#catalog" className="text-sm opacity-70 transition hover:opacity-100">
            View all
          </a>
        </div>
        {loading && <StatusMessage>Loading books...</StatusMessage>}
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {!loading && !error && featuredBooks.length === 0 && (
          <StatusMessage>{t('catalog.noResults')}</StatusMessage>
        )}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      <Divider />

      <section id="catalog" className="mx-auto scroll-mt-24 max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.24em] text-muted">Lantern Library</p>
            <h2 className="text-4xl tracking-[0.06em] sm:text-5xl">{t('catalog.title')}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('catalog.search')}
                className="h-11 w-full min-w-48 rounded-sm border border-border bg-input-background px-9 text-sm outline-none focus:border-ring"
              />
            </label>
            <FilterSelect
              label={t('catalog.filter.genre')}
              value={genre}
              onChange={setGenre}
              values={BOOK_GENRES}
            />
            <FilterSelect
              label={t('catalog.filter.language')}
              value={language}
              onChange={setLanguage}
              values={BOOK_LANGUAGES}
            />
            <select
              value={available}
              onChange={(event) => setAvailable(event.target.value)}
              className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="">{t('catalog.filter.all')}</option>
              <option value="true">{t('admin.dashboard.available')}</option>
              <option value="false">{t('admin.dashboard.unavailable')}</option>
            </select>
          </div>
        </div>

        {loading && <StatusMessage>Loading books...</StatusMessage>}
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {!loading && !error && books.length === 0 && (
          <StatusMessage>{t('catalog.noResults')}</StatusMessage>
        )}

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      <Divider />

      <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl tracking-[0.04em]">How to Order</h2>
        <p className="mx-auto mb-12 max-w-2xl leading-8 opacity-80">
          Ordering is simple and personal. No complicated checkouts, just direct communication.
        </p>
        <div className="grid gap-10 text-left rtl:text-right md:grid-cols-3">
          <Step number="01" title="Browse">
            Explore the catalogue and find the books that speak to you.
          </Step>
          <Step number="02" title="Message">
            Open a book and use the WhatsApp order button to start the conversation.
          </Step>
          <Step number="03" title="Receive">
            We confirm availability, arrange payment, and deliver with care.
          </Step>
        </div>
      </section>

      <Divider />

      <section id="about" className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-4xl tracking-[0.06em]">About Lantern Library</h2>
        <div className="space-y-6 text-[17px] leading-9">
          <p>
            Lantern Library began as a passion project: a place to share thoughtfully curated books
            with readers who value quality, atmosphere, and meaningful reading experiences.
          </p>
          <p>
            Every book should be more than words on pages. It can be a doorway to new perspectives,
            a companion in quiet moments, and a spark for better conversations.
          </p>
          <div className="my-10 rounded-sm border border-border bg-card p-8">
            <h3 className="mb-3 text-2xl">Our Vision</h3>
            <p className="opacity-85">
              We are building toward a warmer, more personal bookstore experience. Until then, this
              catalogue brings that curated feeling online.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section
        id="contact"
        className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 pb-20 sm:px-6 lg:px-8"
      >
        <h2 className="mb-10 text-center text-4xl tracking-[0.06em]">Get in Touch</h2>
        <div className="rounded-sm border border-border bg-card p-6 md:p-10">
          <p className="mb-8 text-center leading-8 opacity-80">
            Reach out for availability, recommendations, or help placing an order.
          </p>
          <div className="grid gap-4">
            <ContactLink
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`}
              icon={<MessageCircle className="h-5 w-5" />}
              title="WhatsApp"
              detail="Order and availability"
            />
            <ContactLink
              href="https://instagram.com/lanternlibrary"
              icon={<Instagram className="h-5 w-5" />}
              title="Instagram"
              detail="@lanternlibrary"
            />
            <ContactLink
              href="mailto:hello@lanternlibrary.com"
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              detail="hello@lanternlibrary.com"
            />
            <div className="flex items-center gap-5 rounded-sm border border-border p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-[var(--icon-color)]">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg">Location</h3>
                <p className="text-sm opacity-70">Online bookstore</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-[var(--icon-color)]">
        {icon}
      </div>
      <h3 className="mb-3 text-xl">{title}</h3>
      <p className="leading-8 opacity-80">{children}</p>
    </div>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-4 text-5xl tracking-[0.05em] opacity-30">{number}</div>
      <h3 className="mb-2 text-xl">{title}</h3>
      <p className="leading-7 opacity-75">{children}</p>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-5 rounded-sm border border-border p-5 transition hover:bg-secondary"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-[var(--icon-color)]">
        {icon}
      </span>
      <span>
        <span className="block text-lg">{title}</span>
        <span className="block text-sm opacity-70">{detail}</span>
      </span>
    </a>
  );
}
