import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBooks } from '../api';
import FilterBar from '../components/FilterBar';
import BookGrid from '../components/BookGrid';

const Catalog = () => {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchBooks();
  }, [i18n.language, filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks({ ...filters, lang: i18n.language });
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('catalog.title')}</h1>
      <FilterBar onFilter={handleFilter} />
      <BookGrid books={books} loading={loading} />
    </div>
  );
};

export default Catalog;
