import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BookCard = ({ book }) => {
  const { t } = useTranslation();
  
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const message = `I would like to order: ${book.title} by ${book.author} - Price: ${book.price}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative flex flex-col h-full card-hover border border-gray-100">
      {!book.isAvailable && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
          <span className="bg-red-600 text-white px-4 py-2 rounded-md font-bold transform -rotate-12">
            {t('book.unavailable')}
          </span>
        </div>
      )}
      
      <Link to={`/book/${book._id}`} className="block flex-shrink-0">
        <div className="h-64 bg-gray-200 w-full overflow-hidden">
          {book.coverImage ? (
             <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {book.genre}
          </span>
        </div>
        
        <Link to={`/book/${book._id}`} className="hover:text-blue-600 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
        </Link>
        <p className="text-gray-600 mb-4">{book.author}</p>
        
        <div className="mt-auto">
          <p className="text-2xl font-bold text-gray-900 mb-4">${book.price}</p>
          
          {book.isAvailable ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {t('book.orderNow')}
            </a>
          ) : (
            <button disabled className="w-full text-center bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded cursor-not-allowed">
               {t('book.unavailable')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
