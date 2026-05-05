import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const genres = ['fiction', 'non-fiction', 'poetry', 'religious', 'children', 'history', 'science', 'other'];
const languages = ['english', 'urdu', 'persian', 'arabic', 'other'];

const FilterBar = ({ onFilter }) => {
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({ search: searchTerm, genre: selectedGenre, language: selectedLanguage });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, selectedLanguage]); // Only trigger when these change
  
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    // the useEffect will handle onFilter
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
      <div className="flex-grow">
        <div className="relative">
          <input
            type="text"
            placeholder={t('catalog.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t('catalog.filter.genre')} ({t('catalog.filter.all')})</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t('catalog.filter.language')} ({t('catalog.filter.all')})</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
