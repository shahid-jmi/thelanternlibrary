import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Menu, Moon, Sun, X } from 'lucide-react';
import GrainTexture from './GrainTexture';
import { useTheme } from '../theme/ThemeContext';

export default function Shell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
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
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg tracking-[0.08em]"
              onClick={closeMenu}
            >
              <BookOpen className="h-5 w-5 text-[var(--icon-color)]" />
              <span>Lantern Library</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-5">
              <a
                className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline"
                href="/#home"
              >
                {t('nav.home')}
              </a>
              <a
                className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline"
                href="/#catalog"
              >
                {t('nav.catalog')}
              </a>
              <a
                className="hidden text-sm opacity-70 transition hover:opacity-100 lg:inline"
                href="/#about"
              >
                About
              </a>
              <a
                className="hidden text-sm opacity-70 transition hover:opacity-100 lg:inline"
                href="/#contact"
              >
                Contact
              </a>
              <Link
                className="hidden text-sm opacity-70 transition hover:opacity-100 sm:inline"
                to="/admin"
              >
                {t('nav.admin')}
              </Link>
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
                  className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100"
                  href="/#home"
                  onClick={closeMenu}
                >
                  {t('nav.home')}
                </a>
                <a
                  className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100"
                  href="/#catalog"
                  onClick={closeMenu}
                >
                  {t('nav.catalog')}
                </a>
                <a
                  className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100"
                  href="/#about"
                  onClick={closeMenu}
                >
                  About
                </a>
                <a
                  className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100"
                  href="/#contact"
                  onClick={closeMenu}
                >
                  Contact
                </a>
                <Link
                  className="rounded-sm px-3 py-2 text-sm opacity-80 transition hover:bg-secondary hover:opacity-100"
                  to="/admin"
                  onClick={closeMenu}
                >
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
