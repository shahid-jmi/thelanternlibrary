import { Component, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router';
import { BrowserRouter } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Edit,
  Instagram,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import GrainTexture from './components/GrainTexture';
import {
  ADMIN_ROLES,
  AdminAccount,
  AdminBook,
  AdminRole,
  BOOK_GENRES,
  BOOK_LANGUAGES,
  BookGenre,
  BookLanguage,
  BookPayload,
  CreateAdminPayload,
  PublicBook,
  createAdmin,
  createBook,
  deactivateAdmin,
  decodeAdminToken,
  deleteAdmin,
  deleteBook,
  getAdminBooks,
  getAdmins,
  getBook,
  getBooks,
  getErrorMessage,
  loginAdmin,
  reactivateAdmin,
  toggleAvailability,
  updateAdminRole,
  updateBook,
} from './api';

const ADMIN_TOKEN_KEY = 'bookstore-admin-token';

function getCurrentAdmin() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return null;
  return decodeAdminToken(token);
}

const emptyPayload: BookPayload = {
  title: { en: '', ur: '' },
  description: { en: '', ur: '' },
  author: '',
  price: 0,
  genre: 'fiction',
  language: 'english',
  isAvailable: true,
};

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Shell>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/admins" element={<AdminManagementPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Shell>
    </BrowserRouter>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string }> {
  state = { message: '' };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'The app hit an unexpected error.' };
  }

  render() {
    if (this.state.message) {
      return (
        <PageFrame compact>
          <StatusMessage tone="error">{this.state.message}</StatusMessage>
        </PageFrame>
      );
    }
    return this.props.children;
  }
}

function Shell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setLanguage = (language: 'en' | 'ur') => {
    i18n.changeLanguage(language);
    localStorage.setItem('bookstore-lang', language);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-foreground">
      <div className="fixed inset-0 z-0 lantern-bg" />
      <GrainTexture />
      <div className="relative z-10">
        <nav className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5 text-lg tracking-[0.08em]" onClick={closeMenu}>
              <BookOpen className="h-5 w-5 text-[var(--icon-color)]" />
              <span>Lantern Library</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-5">
              <a className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline" href="/#home">
                {t('nav.home')}
              </a>
              <a className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline" href="/#catalog">
                {t('nav.catalog')}
              </a>
              <a className="hidden text-sm opacity-70 transition hover:opacity-100 lg:inline" href="/#about">
                About
              </a>
              <a className="hidden text-sm opacity-70 transition hover:opacity-100 lg:inline" href="/#contact">
                Contact
              </a>
              <Link className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline" to="/admin">
                {t('nav.admin')}
              </Link>
              <div className="flex rounded-sm border border-border bg-card p-0.5">
                {(['en', 'ur'] as const).map((language) => (
                  <button
                    key={language}
                    onClick={() => setLanguage(language)}
                    className={`h-8 px-3 text-xs transition ${
                      i18n.language === language ? 'bg-primary text-primary-foreground' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {language === 'en' ? 'EN' : 'اردو'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border sm:hidden"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="border-t border-border/80 bg-background/95 px-4 py-3 sm:hidden">
              <div className="flex flex-col gap-1">
                <a className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100" href="/#home" onClick={closeMenu}>
                  {t('nav.home')}
                </a>
                <a className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100" href="/#catalog" onClick={closeMenu}>
                  {t('nav.catalog')}
                </a>
                <a className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100" href="/#about" onClick={closeMenu}>
                  About
                </a>
                <a className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100" href="/#contact" onClick={closeMenu}>
                  Contact
                </a>
                <Link className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100" to="/admin" onClick={closeMenu}>
                  {t('nav.admin')}
                </Link>
              </div>
            </div>
          )}
        </nav>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="mx-auto my-12 flex max-w-6xl items-center justify-center px-4">
      <div className="h-px flex-1 bg-current opacity-20" />
      <div className="mx-4 h-2 w-2 rotate-45 border border-current opacity-30" />
      <div className="h-px flex-1 bg-current opacity-20" />
    </div>
  );
}

function HomePage() {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [available, setAvailable] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getBooks({ lang: i18n.language, search: debouncedSearch, genre, language, available })
      .then((data) => {
        if (isMounted) {
          setBooks(data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [available, genre, i18n.language, language, debouncedSearch]);

  const featuredBooks = books.slice(0, 4);

  return (
    <main id="home">
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <h1 className="mb-6 text-5xl leading-tight tracking-[0.08em] sm:text-6xl">Lantern Library</h1>
        <p className="mb-8 text-sm italic tracking-[0.08em] opacity-75">Illuminating minds, one book at a time</p>
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 opacity-85">
          A curated collection of timeless literature and contemporary thought. Each book is chosen with care for readers who seek depth, beauty, and meaning in the written word.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#catalog" className="rounded-sm border border-[var(--button-border)] px-8 py-3 text-xs uppercase tracking-[0.18em] transition hover:bg-secondary">
            Browse Catalog
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-sm border border-[var(--button-border)] px-8 py-3 text-xs uppercase tracking-[0.18em] transition hover:bg-secondary">
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
            Every book is handpicked for its quality, relevance, and ability to spark meaningful thought.
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
        {!loading && !error && featuredBooks.length === 0 && <StatusMessage>{t('catalog.noResults')}</StatusMessage>}
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
            <FilterSelect label={t('catalog.filter.genre')} value={genre} onChange={setGenre} values={BOOK_GENRES} />
            <FilterSelect label={t('catalog.filter.language')} value={language} onChange={setLanguage} values={BOOK_LANGUAGES} />
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
        {!loading && !error && books.length === 0 && <StatusMessage>{t('catalog.noResults')}</StatusMessage>}

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      <Divider />

      <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl tracking-[0.04em]">How to Order</h2>
        <p className="mx-auto mb-12 max-w-2xl leading-8 opacity-80">Ordering is simple and personal. No complicated checkouts, just direct communication.</p>
        <div className="grid gap-10 text-left rtl:text-right md:grid-cols-3">
          <Step number="01" title="Browse">Explore the catalogue and find the books that speak to you.</Step>
          <Step number="02" title="Message">Open a book and use the WhatsApp order button to start the conversation.</Step>
          <Step number="03" title="Receive">We confirm availability, arrange payment, and deliver with care.</Step>
        </div>
      </section>

      <Divider />

      <section id="about" className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-4xl tracking-[0.06em]">About Lantern Library</h2>
        <div className="space-y-6 text-[17px] leading-9">
          <p>
            Lantern Library began as a passion project: a place to share thoughtfully curated books with readers who value quality, atmosphere, and meaningful reading experiences.
          </p>
          <p>
            Every book should be more than words on pages. It can be a doorway to new perspectives, a companion in quiet moments, and a spark for better conversations.
          </p>
          <div className="my-10 rounded-sm border border-border bg-card p-8">
            <h3 className="mb-3 text-2xl">Our Vision</h3>
            <p className="opacity-85">
              We are building toward a warmer, more personal bookstore experience. Until then, this catalogue brings that curated feeling online.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section id="contact" className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-4xl tracking-[0.06em]">Get in Touch</h2>
        <div className="rounded-sm border border-border bg-card p-6 md:p-10">
          <p className="mb-8 text-center leading-8 opacity-80">Reach out for availability, recommendations, or help placing an order.</p>
          <div className="grid gap-4">
            <ContactLink href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`} icon={<MessageCircle className="h-5 w-5" />} title="WhatsApp" detail="Order and availability" />
            <ContactLink href="https://instagram.com/lanternlibrary" icon={<Instagram className="h-5 w-5" />} title="Instagram" detail="@lanternlibrary" />
            <ContactLink href="mailto:hello@lanternlibrary.com" icon={<Mail className="h-5 w-5" />} title="Email" detail="hello@lanternlibrary.com" />
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

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-[var(--icon-color)]">{icon}</div>
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

function ContactLink({ href, icon, title, detail }: { href: string; icon: ReactNode; title: string; detail: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-5 rounded-sm border border-border p-5 transition hover:bg-secondary">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-[var(--icon-color)]">{icon}</span>
      <span>
        <span className="block text-lg">{title}</span>
        <span className="block text-sm opacity-70">{detail}</span>
      </span>
    </a>
  );
}

function BookCard({ book }: { book: PublicBook }) {
  const { t } = useTranslation();

  return (
    <Link to={`/book/${book._id}`} className="group block">
      <div className="mb-4 aspect-[2/3] overflow-hidden rounded-sm border border-border bg-card">
        {book.coverImage?.url ? (
          <img src={book.coverImage.url} alt={book.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
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

function BookDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [book, setBook] = useState<PublicBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBook(id, i18n.language)
      .then((data) => {
        setBook(data);
        setError('');
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [id, i18n.language]);

  const whatsappUrl = useMemo(() => {
    if (!book) return '';
    const message = `I would like to order: ${book.title} by ${book.author} - Price: ${book.price}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [book, whatsappNumber]);

  if (loading) return <PageFrame><StatusMessage>Loading book...</StatusMessage></PageFrame>;
  if (error || !book) return <PageFrame><StatusMessage tone="error">{error || 'Book not found'}</StatusMessage></PageFrame>;

  return (
    <PageFrame>
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm opacity-75 transition hover:opacity-100">
        <ArrowLeft className="h-4 w-4" />
        {t('book.backToCatalog')}
      </Link>
      <section className="grid gap-10 lg:grid-cols-[minmax(260px,420px),1fr]">
        <div className="aspect-[2/3] overflow-hidden rounded-sm border border-border bg-card">
          {book.coverImage?.url ? (
            <img src={book.coverImage.url} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center opacity-60">
              <BookOpen className="h-12 w-12" />
              <span className="text-xl">{book.title}</span>
            </div>
          )}
        </div>
        <div className="py-2">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-muted">{book.genre}</p>
          <h1 className="mb-4 text-4xl leading-tight tracking-[0.04em] sm:text-5xl">{book.title}</h1>
          <p className="mb-8 text-xl italic opacity-75">{book.author}</p>
          <p className="mb-8 max-w-2xl text-base leading-8 opacity-85">{book.description}</p>
          <dl className="mb-8 grid gap-4 sm:grid-cols-2">
            <Info label={t('book.price')} value={formatPrice(book.price)} />
            <Info label={t('book.author')} value={book.author} />
            <Info label={t('book.genre')} value={book.genre} />
            <Info label={t('book.language')} value={book.language} />
          </dl>
          {book.isAvailable ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-primary-foreground transition hover:opacity-90">
              <MessageCircle className="h-5 w-5" />
              {t('book.orderNow')}
            </a>
          ) : (
            <button disabled className="inline-flex h-12 items-center rounded-sm border border-border px-6 opacity-55">
              {t('book.unavailable')}
            </button>
          )}
        </div>
      </section>
    </PageFrame>
  );
}

function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ADMIN_TOKEN_KEY)) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError) || t('admin.login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame compact>
      <form onSubmit={submit} className="mx-auto max-w-md rounded-sm border border-border bg-card p-8">
        <div className="mb-8 flex items-center gap-3">
          <Lock className="h-5 w-5 text-[var(--icon-color)]" />
          <h1 className="text-3xl tracking-[0.05em]">{t('admin.login.title')}</h1>
        </div>
        <label className="mb-2 block text-sm">{t('admin.login.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
          required
        />
        <label className="mb-2 block text-sm">{t('admin.login.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
          required
        />
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <button disabled={submitting} className="h-11 w-full rounded-sm bg-primary px-5 text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {t('admin.login.submit')}
        </button>
      </form>
    </PageFrame>
  );
}

function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [editing, setEditing] = useState<AdminBook | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isSuperAdmin = getCurrentAdmin()?.role === 'super_admin';

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate('/admin', { replace: true });
  };

  const handleAuthError = (requestError: unknown) => {
    const status = (requestError as { response?: { status?: number } }).response?.status;
    if (status === 401) {
      logout();
      return true;
    }
    return false;
  };

  const loadBooks = async () => {
    if (!localStorage.getItem(ADMIN_TOKEN_KEY)) {
      navigate('/admin', { replace: true });
      return;
    }
    setLoading(true);
    try {
      setBooks(await getAdminBooks());
      setError('');
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const saveBook = async (payload: BookPayload, coverImageFile: File | null) => {
    try {
      if (editing) {
        await updateBook(editing._id, payload, coverImageFile);
      } else {
        await createBook(payload, coverImageFile);
      }
      setEditing(null);
      setShowForm(false);
      await loadBooks();
    } catch (requestError) {
      if (handleAuthError(requestError)) return;
      throw requestError;
    }
  };

  const removeBook = async (book: AdminBook) => {
    if (!window.confirm(`${t('admin.dashboard.delete')} "${book.title.en}"?`)) return;
    try {
      await deleteBook(book._id);
      await loadBooks();
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    }
  };

  const flipAvailability = async (book: AdminBook) => {
    try {
      await toggleAvailability(book._id, !book.isAvailable);
      await loadBooks();
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
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
            <Link to="/admin/admins" className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm">
              <Users className="h-4 w-4" />
              {t('admin.nav.manageAdmins')}
            </Link>
          )}
          <button onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {loading && <StatusMessage>Loading books...</StatusMessage>}

      {showForm && (
        <BookForm
          book={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
          onSave={saveBook}
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
                  <button onClick={() => flipAvailability(book)} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5">
                    {book.isAvailable && <Check className="h-3.5 w-3.5" />}
                    {book.isAvailable ? t('admin.dashboard.available') : t('admin.dashboard.unavailable')}
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
                    <button onClick={() => removeBook(book)} className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-destructive">
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

function AdminManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentAdmin = getCurrentAdmin();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAuthError = (requestError: unknown) => {
    const status = (requestError as { response?: { status?: number } }).response?.status;
    if (status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      navigate('/admin', { replace: true });
      return true;
    }
    return false;
  };

  const loadAdmins = async () => {
    if (!localStorage.getItem(ADMIN_TOKEN_KEY)) {
      navigate('/admin', { replace: true });
      return;
    }
    setLoading(true);
    try {
      setAdmins(await getAdmins());
      setError('');
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const addAdmin = async (payload: CreateAdminPayload) => {
    try {
      await createAdmin(payload);
      setShowForm(false);
      await loadAdmins();
    } catch (requestError) {
      if (handleAuthError(requestError)) return;
      throw requestError;
    }
  };

  const removeAdmin = async (admin: AdminAccount) => {
    if (!window.confirm(`${t('admin.admins.delete')} ${admin.email}?`)) return;
    try {
      await deleteAdmin(admin._id);
      await loadAdmins();
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    }
  };

  const toggleActive = async (admin: AdminAccount) => {
    try {
      if (admin.isActive) {
        await deactivateAdmin(admin._id);
      } else {
        await reactivateAdmin(admin._id);
      }
      await loadAdmins();
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    }
  };

  const changeRole = async (admin: AdminAccount, role: AdminRole) => {
    if (role === admin.role) return;
    try {
      await updateAdminRole(admin._id, role);
      await loadAdmins();
    } catch (requestError) {
      if (!handleAuthError(requestError)) setError(getErrorMessage(requestError));
    }
  };

  return (
    <PageFrame>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[var(--icon-color)]" />
          <h1 className="text-4xl tracking-[0.05em]">{t('admin.admins.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            {t('admin.admins.addAdmin')}
          </button>
          <Link to="/admin/dashboard" className="inline-flex h-10 items-center gap-2 rounded-sm border border-border px-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {t('admin.admins.backToDashboard')}
          </Link>
        </div>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {loading && <StatusMessage>{t('admin.admins.loading')}</StatusMessage>}

      {showForm && <AdminForm onCancel={() => setShowForm(false)} onSave={addAdmin} />}

      <div className="overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm rtl:text-right">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-4 py-3">{t('admin.admins.email')}</th>
              <th className="px-4 py-3">{t('admin.admins.role')}</th>
              <th className="px-4 py-3">{t('admin.admins.status')}</th>
              <th className="px-4 py-3">{t('admin.admins.lastLogin')}</th>
              <th className="px-4 py-3">{t('admin.admins.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin._id === currentAdmin?.sub;
              return (
                <tr key={admin._id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    {admin.email}
                    {isSelf && <span className="ml-2 text-xs opacity-60 rtl:ml-0 rtl:mr-2">({t('admin.admins.you')})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect value={admin.role} disabled={isSelf} onChange={(role) => changeRole(admin, role)} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(admin)}
                      disabled={isSelf}
                      className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 disabled:opacity-50"
                    >
                      {admin.isActive && <Check className="h-3.5 w-3.5" />}
                      {admin.isActive ? t('admin.admins.active') : t('admin.admins.inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : t('admin.admins.never')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeAdmin(admin)}
                      disabled={isSelf}
                      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.admins.delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageFrame>
  );
}

function RoleSelect({ value, onChange, disabled }: { value: AdminRole; onChange: (role: AdminRole) => void; disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as AdminRole)}
      className="h-9 rounded-sm border border-border bg-input-background px-2 text-sm outline-none focus:border-ring disabled:opacity-50"
    >
      {ADMIN_ROLES.map((role) => (
        <option key={role} value={role}>
          {t(`admin.admins.role.${role}`)}
        </option>
      ))}
    </select>
  );
}

function AdminForm({ onCancel, onSave }: { onCancel: () => void; onSave: (payload: CreateAdminPayload) => Promise<void> }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ email, password, role });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8 rounded-sm border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label={t('admin.admins.email')} value={email} onChange={setEmail} required />
        <label className="block text-sm">
          {t('admin.admins.password')}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
            required
            minLength={8}
          />
        </label>
        <label className="block text-sm">
          {t('admin.admins.role')}
          <div className="mt-1">
            <RoleSelect value={role} onChange={setRole} />
          </div>
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button disabled={saving} className="h-10 rounded-sm bg-primary px-5 text-sm text-primary-foreground disabled:opacity-60">
          {t('admin.admins.save')}
        </button>
        <button type="button" onClick={onCancel} className="h-10 rounded-sm border border-border px-5 text-sm">
          {t('admin.admins.cancel')}
        </button>
      </div>
    </form>
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
        <TextInput label={t('admin.form.titleEn')} value={form.title.en} onChange={(value) => setNested('title', 'en', value)} dir="ltr" required />
        <TextInput label={t('admin.form.titleUr')} value={form.title.ur || ''} onChange={(value) => setNested('title', 'ur', value)} dir="rtl" />
        <TextInput label={t('admin.form.author')} value={form.author} onChange={(value) => setField('author', value)} required />
        <TextArea label={t('admin.form.descEn')} value={form.description.en} onChange={(value) => setNested('description', 'en', value)} dir="ltr" required />
        <TextArea label={t('admin.form.descUr')} value={form.description.ur || ''} onChange={(value) => setNested('description', 'ur', value)} dir="rtl" />
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
        <SelectInput label={t('admin.form.genre')} value={form.genre} onChange={(value) => setField('genre', value as BookGenre)} values={BOOK_GENRES} />
        <SelectInput label={t('admin.form.language')} value={form.language} onChange={(value) => setField('language', value as BookLanguage)} values={BOOK_LANGUAGES} />
        <label className="block text-sm">
          {t('admin.form.coverImage')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          {book?.coverImage?.url && !coverImageFile && (
            <img src={book.coverImage.url} alt="" className="mt-2 h-24 w-16 rounded-sm border border-border object-cover" />
          )}
        </label>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input type="checkbox" checked={form.isAvailable} onChange={(event) => setField('isAvailable', event.target.checked)} />
          {t('admin.dashboard.available')}
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button disabled={saving} className="h-10 rounded-sm bg-primary px-5 text-sm text-primary-foreground disabled:opacity-60">
          {t('admin.form.save')}
        </button>
        <button type="button" onClick={onCancel} className="h-10 rounded-sm border border-border px-5 text-sm">
          {t('admin.form.cancel')}
        </button>
      </div>
    </form>
  );
}

function FilterSelect({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[] }) {
  const { t } = useTranslation();
  return (
    <select value={value} aria-label={label} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none focus:border-ring">
      <option value="">{t('catalog.filter.all')}</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

function SelectInput({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[] }) {
  return (
    <label className="block text-sm">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring">
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextInput({ label, value, onChange, dir, required }: { label: string; value: string; onChange: (value: string) => void; dir?: 'ltr' | 'rtl'; required?: boolean }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={dir}
        required={required}
        className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, dir, required }: { label: string; value: string; onChange: (value: string) => void; dir?: 'ltr' | 'rtl'; required?: boolean }) {
  return (
    <label className="block text-sm md:col-span-1">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={dir}
        required={required}
        rows={4}
        className="mt-1 w-full rounded-sm border border-border bg-input-background px-3 py-2 outline-none focus:border-ring"
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <dt className="mb-1 text-xs uppercase tracking-[0.18em] opacity-55">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function StatusMessage({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`mb-6 rounded-sm border border-border bg-card p-4 text-sm ${tone === 'error' ? 'text-destructive' : 'opacity-75'}`}>
      {children}
    </div>
  );
}

function PageFrame({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <main className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? 'py-16' : 'py-10'}`}>{children}</main>;
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

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
}
