import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, MessageCircle, Moon, Sun, X } from 'lucide-react';
import { Logo } from '@/app/components/Logo';
import GrainTexture from '@/app/components/GrainTexture';
import Bokeh from '@/app/components/Bokeh';
import Footer from '@/app/components/Footer';
import { useTheme } from '@/app/theme/ThemeContext';

type HomeSection = 'home' | 'about' | 'contact';
// "home" has no section of its own to observe — id="home" sits on the
// <main> wrapping the whole page, not just the hero — so it's the default
// state whenever neither of the other two sections is in view.
const OBSERVED_SECTIONS: Exclude<HomeSection, 'home'>[] = ['about', 'contact'];

const navLinkClass = (active: boolean) =>
  `relative inline-block text-sm transition after:absolute after:-bottom-2.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-ember after:transition-opacity after:content-[''] hover:text-ember hover:opacity-100 ${
    active ? 'text-ember opacity-100 after:opacity-100' : 'opacity-70 after:opacity-0'
  }`;

const mobileNavLinkClass = (active: boolean) =>
  `rounded-sm px-3 py-2 text-sm transition hover:bg-secondary hover:text-ember hover:opacity-100 ${
    active ? 'bg-secondary text-ember opacity-100' : 'opacity-80'
  }`;

export default function Shell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSection>('home');
  const isAdmin = pathname.startsWith('/admin');
  const isHome = pathname === '/';
  const isCatalog = pathname === '/catalog';

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        setActiveSection((visible?.target.id as HomeSection) ?? 'home');
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    const elements = OBSERVED_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isHome]);

  const setLanguage = (language: 'en' | 'ur') => {
    i18n.changeLanguage(language);
    localStorage.setItem('bookstore-lang', language);
  };

  const closeMenu = () => setIsMenuOpen(false);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  return (
    <div className="min-h-screen relative text-foreground">
      <div className="fixed inset-0 z-0 lantern-bg" />
      {!isAdmin && <Bokeh />}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[50]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 68%, var(--vignette) 100%)',
        }}
      />
      <GrainTexture />
      <div className="relative z-10">
        <nav className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="min-w-0" onClick={closeMenu}>
              <Logo />
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-5">
              <a
                className={`hidden sm:inline ${navLinkClass(isHome && activeSection === 'home')}`}
                href="/#home"
                aria-current={isHome && activeSection === 'home' ? 'page' : undefined}
              >
                {t('nav.home')}
              </a>
              <Link
                className={`hidden items-center rounded-full px-3 py-1 text-sm transition sm:inline-flex ${
                  isCatalog
                    ? 'bg-ember text-ember-foreground'
                    : 'bg-ember/10 text-ember hover:bg-ember/20'
                }`}
                to="/catalog"
                aria-current={isCatalog ? 'page' : undefined}
              >
                {t('nav.catalog')}
              </Link>
              <a
                className={`hidden lg:inline ${navLinkClass(isHome && activeSection === 'about')}`}
                href="/#about"
                aria-current={isHome && activeSection === 'about' ? 'page' : undefined}
              >
                About
              </a>
              <a
                className={`hidden lg:inline ${navLinkClass(isHome && activeSection === 'contact')}`}
                href="/#contact"
                aria-current={isHome && activeSection === 'contact' ? 'page' : undefined}
              >
                Contact
              </a>
              <div className="flex rounded-sm border border-border bg-card p-0.5">
                {(['en', 'ur'] as const).map((language) => (
                  <button
                    key={language}
                    onClick={() => setLanguage(language)}
                    className={`h-8 px-3 text-xs transition ${
                      i18n.language === language
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {language === 'en' ? 'EN' : 'اردو'}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border transition hover:bg-secondary"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-[var(--icon-color)]" />
                ) : (
                  <Moon className="h-4 w-4 text-[var(--icon-color)]" />
                )}
              </button>
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
                <a
                  className={mobileNavLinkClass(isHome && activeSection === 'home')}
                  href="/#home"
                  onClick={closeMenu}
                  aria-current={isHome && activeSection === 'home' ? 'page' : undefined}
                >
                  {t('nav.home')}
                </a>
                <Link
                  className={mobileNavLinkClass(isCatalog)}
                  to="/catalog"
                  onClick={closeMenu}
                  aria-current={isCatalog ? 'page' : undefined}
                >
                  {t('nav.catalog')}
                </Link>
                <a
                  className={mobileNavLinkClass(isHome && activeSection === 'about')}
                  href="/#about"
                  onClick={closeMenu}
                  aria-current={isHome && activeSection === 'about' ? 'page' : undefined}
                >
                  About
                </a>
                <a
                  className={mobileNavLinkClass(isHome && activeSection === 'contact')}
                  href="/#contact"
                  onClick={closeMenu}
                  aria-current={isHome && activeSection === 'contact' ? 'page' : undefined}
                >
                  Contact
                </a>
              </div>
            </div>
          )}
        </nav>
        {children}
        {!isAdmin && <Footer />}
      </div>
      {!isAdmin && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm text-white shadow-lg transition hover:brightness-105 rtl:right-auto rtl:left-5"
        >
          <span
            aria-hidden="true"
            className="whatsapp-pulse-ring absolute inset-0 rounded-full bg-[#25D366]"
          />
          <MessageCircle className="relative h-5 w-5 shrink-0" />
          <span className="relative hidden sm:inline">Chat with us</span>
        </a>
      )}
    </div>
  );
}
