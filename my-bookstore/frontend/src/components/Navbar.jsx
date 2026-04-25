import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Bookstore
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
              {t('nav.catalog')}
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">
              {t('nav.admin')}
            </Link>
            <div className="ps-4">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              {t('nav.catalog')}
            </Link>
            <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              {t('nav.admin')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
