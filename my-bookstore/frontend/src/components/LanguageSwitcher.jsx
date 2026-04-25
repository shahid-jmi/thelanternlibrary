import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('bookstore-lang', lng);
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded transition-colors ${
          i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
        aria-label="English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ur')}
        className={`px-3 py-1 rounded transition-colors ${
          i18n.language === 'ur' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
        aria-label="Urdu"
      >
        اردو
      </button>
    </div>
  );
};

export default LanguageSwitcher;
