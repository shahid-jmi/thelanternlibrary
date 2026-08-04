import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Armchair,
  BookOpen,
  Coffee,
  Feather,
  FileText,
  Flower2,
  Instagram,
  Lamp,
  Library,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Scroll,
  Search,
  ShoppingBag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BOOK_GENRES, BOOK_LANGUAGES } from '../api/types';
import { getErrorMessage } from '../api/client';
import { useBooks } from '../queries/books';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import BookCard from '../components/BookCard';
import Divider from '../components/Divider';
import StatusMessage from '../components/StatusMessage';
import { FilterSelect } from '../components/FormControls';
import Reveal from '../components/Reveal';
import ImageTile from '../components/ImageTile';
import LanternMark from '../components/LanternMark';
import { Eyebrow } from '../components/ui';

const OFFERINGS: { numeral: string; name: string; line: string; icon: LucideIcon }[] = [
  {
    numeral: 'i',
    name: 'Books',
    line: 'Stories chosen slowly, shelved with care.',
    icon: BookOpen,
  },
  { numeral: 'ii', name: 'Postcards', line: 'Small windows mailed from the valley.', icon: Mail },
  {
    numeral: 'iii',
    name: 'Handwritten Letters',
    line: 'Ink, paper, and a little time.',
    icon: Feather,
  },
  { numeral: 'iv', name: 'Typewritten Goods', line: 'Keys pressed, words kept.', icon: FileText },
  { numeral: 'v', name: 'Canvas Totes', line: 'For carrying stories home.', icon: ShoppingBag },
  {
    numeral: 'vi',
    name: 'Dried Flowers',
    line: "Kashmir's gardens, paused mid-bloom.",
    icon: Flower2,
  },
  {
    numeral: 'vii',
    name: 'Kashmir Collectibles',
    line: 'Keepsakes of a storied valley.',
    icon: Mountain,
  },
  { numeral: 'viii', name: 'Vintage Paper', line: 'Ephemera that survived its era.', icon: Scroll },
];

const MOSAIC: { numeral: string; label: string; icon: LucideIcon }[] = [
  { numeral: 'i', label: 'Lamplight', icon: Lamp },
  { numeral: 'ii', label: 'Reading corners', icon: Armchair },
  { numeral: 'iii', label: 'The shelves', icon: Library },
  { numeral: 'iv', label: 'Kahwa & pages', icon: Coffee },
];

const TESTIMONIALS = [
  {
    numeral: 'i',
    quote:
      'I asked for something quiet, and a week later a book arrived that I still think about on evening walks.',
    name: 'Mehak',
    city: 'Srinagar',
  },
  {
    numeral: 'ii',
    quote:
      'The parcel smelled of old paper. Reading it felt like borrowing from the shelf of a friend.',
    name: 'Arjun',
    city: 'Delhi',
  },
  {
    numeral: 'iii',
    quote: 'It is less like buying a book and more like being handed a lantern.',
    name: 'Zoya',
    city: 'Baramulla',
  },
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [available, setAvailable] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const carouselRef = useRef<HTMLDivElement>(null);

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
  const featuredBooks = books.slice(0, 8);

  const scrollCarousel = (direction: number) => {
    carouselRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  };

  return (
    <main id="home">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[45fr_55fr] lg:gap-16 lg:px-8">
        <Reveal>
          <ImageTile
            className="aspect-[4/3] w-full lg:aspect-[4/5]"
            placeholder={
              <div className="flex flex-col items-center gap-6 text-tile-foreground">
                <LanternMark className="h-32 w-auto sm:h-40" />
                <span className="text-[9px] uppercase tracking-loose opacity-70">
                  The reading room — Srinagar
                </span>
              </div>
            }
          />
        </Reveal>
        <Reveal delay={120}>
          <div className="text-center lg:text-start">
            <p className="mb-5 text-[10px] uppercase tracking-widest text-accent">
              · A Curated Catalog — Srinagar, Kashmir ·
            </p>
            <h1 className="mb-6 text-5xl leading-tight tracking-normal sm:text-6xl">
              The Lantern <span className="italic text-accent">Library</span>
            </h1>
            <p className="mb-8 text-sm italic tracking-normal opacity-75">
              Where books and memory live together.
            </p>
            <p className="mb-10 max-w-xl text-lg leading-8 opacity-85 lg:mx-0">
              A curated collection of timeless literature and contemporary thought. Each book is
              chosen with care for readers who seek depth, beauty, and meaning in the written word.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <a
                href="#catalog"
                className="rounded-sm bg-ember px-8 py-3.5 text-xs uppercase tracking-label text-ember-foreground transition hover:brightness-110"
              >
                Browse Catalog →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3.5 text-xs uppercase tracking-label transition hover:border-ember hover:text-ember"
              >
                <MessageCircle className="h-4 w-4" />
                Order Directly
              </a>
            </div>
            <p className="mt-14 text-[10px] uppercase tracking-wide-lg opacity-55">
              — Est. on a long winter afternoon —
            </p>
          </div>
        </Reveal>
      </section>

      <Divider />

      <section id="offer" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <Eyebrow className="mb-3 text-center">i.</Eyebrow>
          <h2 className="mb-4 text-center text-3xl tracking-tight">What We Offer</h2>
          <p className="mx-auto mb-12 max-w-xl text-center italic leading-7 opacity-70">
            Books first — and the quiet objects that belong beside them.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {OFFERINGS.map((item, index) => (
            <Reveal key={item.name} delay={(index % 4) * 70}>
              <ImageTile
                className="aspect-[4/5]"
                placeholder={<item.icon className="h-10 w-10 text-tile-accent" strokeWidth={1.25} />}
                overlay={
                  <span className="absolute left-3 top-2 text-sm italic text-tile-accent">
                    {item.numeral}.
                  </span>
                }
              />
              <h3 className="mt-4 text-lg leading-snug">{item.name}</h3>
              <p className="mt-1 text-sm italic leading-6 opacity-65">{item.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-sm border border-border md:grid-cols-2">
            <div className="dark flex flex-col items-start gap-5 bg-background px-8 py-12 text-foreground sm:px-12">
              <p className="text-[10px] uppercase tracking-wide-lg text-accent">The Shelves</p>
              <h3 className="text-3xl tracking-tight">Browse Our Library</h3>
              <p className="max-w-sm italic leading-7 opacity-75">
                Fiction, memoir, poetry, and the occasional unclassifiable thing — each spine read
                before it is sold.
              </p>
              <div className="flex gap-3">
                {[BookOpen, Feather, Scroll].map((Icon, index) => (
                  <div
                    key={index}
                    className="flex h-16 w-14 items-center justify-center rounded-sm border border-border"
                  >
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.25} />
                  </div>
                ))}
              </div>
              <a
                href="#catalog"
                className="mt-2 rounded-sm border border-[var(--button-border)] px-6 py-3 text-xs uppercase tracking-label transition hover:border-accent hover:text-accent"
              >
                Enter the Library →
              </a>
            </div>
            <div className="flex flex-col items-start gap-5 bg-ember px-8 py-12 text-ember-foreground sm:px-12">
              <p className="text-[10px] uppercase tracking-wide-lg opacity-80">The Cabinet</p>
              <h3 className="text-3xl tracking-tight">Explore Art &amp; Gifts</h3>
              <p className="max-w-sm italic leading-7 opacity-85">
                Postcards, dried flowers, letters written by hand — small things that carry the
                valley with them.
              </p>
              <div className="flex gap-3">
                {[Mail, Flower2, Mountain].map((Icon, index) => (
                  <div
                    key={index}
                    className="flex h-16 w-14 items-center justify-center rounded-sm border border-ember-foreground/40"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.25} />
                  </div>
                ))}
              </div>
              <a
                href="#offer"
                className="mt-2 rounded-sm border border-ember-foreground/60 px-6 py-3 text-xs uppercase tracking-label transition hover:bg-[rgba(0,0,0,0.12)]"
              >
                See the Collection →
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <Divider />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <Eyebrow className="mb-3">ii.</Eyebrow>
              <h2 className="text-3xl tracking-tight">Featured Books</h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#catalog"
                className="hidden text-xs uppercase tracking-label text-ember transition hover:opacity-75 sm:inline"
              >
                View all →
              </a>
              <button
                onClick={() => scrollCarousel(-1)}
                aria-label="Scroll featured books back"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
              >
                ‹
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                aria-label="Scroll featured books forward"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--button-border)] text-lg transition hover:border-ember hover:text-ember"
              >
                ›
              </button>
            </div>
          </div>
        </Reveal>
        {loading && <StatusMessage>Loading books...</StatusMessage>}
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {!loading && !error && featuredBooks.length === 0 && (
          <StatusMessage>{t('catalog.noResults')}</StatusMessage>
        )}
        <div ref={carouselRef} className="no-scrollbar flex snap-x gap-7 overflow-x-auto pb-2">
          {featuredBooks.map((book, index) => (
            <Reveal key={book._id} delay={index * 60} className="w-60 shrink-0 snap-start">
              <BookCard book={book} />
            </Reveal>
          ))}
        </div>
      </section>

      <Divider />

      <section id="catalog" className="mx-auto scroll-mt-24 max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-accent">
              iii. · The Shelves
            </p>
            <h2 className="text-4xl tracking-snug sm:text-5xl">{t('catalog.title')}</h2>
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
          <div className="py-16 text-center">
            <LanternMark className="mx-auto mb-6 h-20 w-auto text-accent opacity-70" />
            <p className="italic opacity-70">{t('catalog.noResults')}</p>
          </div>
        )}

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      <section className="dark mt-12 w-full border-y border-border bg-background py-20 text-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <Eyebrow className="mb-3">iv.</Eyebrow>
            <h2 className="mb-6 text-4xl leading-tight tracking-tight">
              A Space Built on Feeling
            </h2>
            <p className="mb-5 text-xl italic leading-9 opacity-90">
              Some bookshops sell paper. We would rather lend you a lamp.
            </p>
            <p className="max-w-md leading-8 opacity-75">
              The library began in one room in Srinagar — shelves against a cold wall, kahwa going
              lukewarm, someone always reading aloud. This catalog is our attempt to keep that room
              open to anyone, anywhere.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {MOSAIC.map((tile, index) => (
              <Reveal key={tile.label} delay={index * 80}>
                <ImageTile
                  className="aspect-square"
                  placeholder={
                    <div className="flex flex-col items-center gap-3 text-tile-foreground">
                      <tile.icon className="h-8 w-8 text-tile-accent" strokeWidth={1.25} />
                      <span className="text-[9px] uppercase tracking-wide-lg opacity-70">
                        {tile.label}
                      </span>
                    </div>
                  }
                  overlay={
                    <span className="absolute left-3 top-2 text-sm italic text-tile-accent">
                      {tile.numeral}.
                    </span>
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <Eyebrow className="mb-3 text-center">v.</Eyebrow>
          <h2 className="mb-12 text-center text-3xl tracking-tight">From Our Readers</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 80}>
              <figure className="relative h-full rounded-sm border border-border bg-card p-8">
                <span className="absolute right-4 top-3 text-sm italic text-accent">
                  {testimonial.numeral}.
                </span>
                <span aria-hidden="true" className="block text-6xl leading-none text-accent">
                  “
                </span>
                <blockquote className="mt-2 italic leading-8 opacity-85">
                  {testimonial.quote}
                </blockquote>
                <div className="mt-6 h-px w-10 bg-accent/60" />
                <figcaption className="mt-3 text-sm">
                  {testimonial.name}
                  <span className="ml-2 italic opacity-60">— {testimonial.city}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <Divider />

      <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <Reveal>
          <Eyebrow className="mb-3">vi.</Eyebrow>
          <h2 className="mb-4 text-3xl tracking-tight">How to Order</h2>
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
        </Reveal>
      </section>

      <Divider />

      <section id="about" className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <Eyebrow className="mb-3 text-center">vii.</Eyebrow>
          <h2 className="mb-10 text-center text-4xl tracking-snug">About Lantern Library</h2>
          <div className="space-y-6 text-[17px] leading-9">
            <p>
              Lantern Library began as a passion project: a place to share thoughtfully curated
              books with readers who value quality, atmosphere, and meaningful reading experiences.
            </p>
            <p>
              Every book should be more than words on pages. It can be a doorway to new
              perspectives, a companion in quiet moments, and a spark for better conversations.
            </p>
            <div className="my-10 rounded-sm border border-border bg-card p-8">
              <h3 className="mb-3 text-2xl">Our Vision</h3>
              <p className="opacity-85">
                We are building toward a warmer, more personal bookstore experience. Until then,
                this catalogue brings that curated feeling online.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Divider />

      <section
        id="contact"
        className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 pb-20 sm:px-6 lg:px-8"
      >
        <Reveal>
          <Eyebrow className="mb-3 text-center">viii.</Eyebrow>
          <h2 className="mb-10 text-center text-4xl tracking-snug">Get in Touch</h2>
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
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-ember">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg">Location</h3>
                  <p className="text-sm opacity-70">Srinagar, Kashmir</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-4 text-5xl italic tracking-[0.05em] text-accent/60">{number}</div>
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
      className="flex items-center gap-5 rounded-sm border border-border p-5 transition hover:border-ember/60 hover:bg-secondary"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-ember">
        {icon}
      </span>
      <span>
        <span className="block text-lg">{title}</span>
        <span className="block text-sm opacity-70">{detail}</span>
      </span>
    </a>
  );
}
