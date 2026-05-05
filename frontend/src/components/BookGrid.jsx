import React from 'react';
import { useTranslation } from 'react-i18next';
import BookCard from './BookCard';

const BookGrid = ({ books, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
            <div className="h-64 bg-gray-300 rounded-t-lg"></div>
            <div className="p-5 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600">{t('catalog.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
