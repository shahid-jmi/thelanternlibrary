import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBook } from '../api';

const BookDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBook(id, i18n.language);
        setBook(data);
        setError(false);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, i18n.language]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 h-96 bg-gray-300 rounded-lg"></div>
        <div className="w-full md:w-2/3 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('catalog.noResults')}</h2>
        <Link to="/" className="text-blue-600 hover:underline">{t('book.backToCatalog')}</Link>
      </div>
    );
  }

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const message = `I would like to order: ${book.title} by ${book.author} - Price: ${book.price}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1 rtl:ml-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t('book.backToCatalog')}
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-gray-100 p-6 flex justify-center items-center">
          {book.coverImage ? (
             <img src={book.coverImage} alt={book.title} className="max-w-full h-auto shadow-lg rounded" />
          ) : (
            <div className="w-48 h-64 bg-gray-200 flex items-center justify-center text-gray-400 rounded shadow">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 p-8 flex flex-col">
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded font-medium">
              {book.genre}
            </span>
            <span className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded font-medium ms-2">
              {book.language}
            </span>
            {!book.isAvailable && (
              <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded font-bold ms-2">
                {t('book.unavailable')}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{t('book.author')}: <span className="font-semibold text-gray-800">{book.author}</span></p>
          
          <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap flex-grow">
            {book.description}
          </div>
          
          <div className="mt-auto border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <span className="text-sm text-gray-500">{t('book.price')}</span>
                <p className="text-3xl font-bold text-gray-900">${book.price}</p>
              </div>
              
              {book.isAvailable ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors text-lg"
                >
                  {t('book.orderNow')}
                </a>
              ) : (
                <button disabled className="bg-gray-300 text-gray-500 font-bold py-3 px-8 rounded-lg cursor-not-allowed text-lg">
                  {t('book.unavailable')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
