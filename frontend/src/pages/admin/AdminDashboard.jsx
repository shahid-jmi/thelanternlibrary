import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminGetBooks, adminDeleteBook, adminToggleAvailability } from '../../api';
import BookForm from './BookForm';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('bookstore-admin-token');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await adminGetBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching admin books:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bookstore-admin-token');
    navigate('/admin');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await adminDeleteBook(id);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await adminToggleAvailability(id, !currentStatus);
      fetchBooks();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const openCreateForm = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const openEditForm = (book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleFormSave = () => {
    closeForm();
    fetchBooks();
  };

  if (isFormOpen) {
    return <BookForm book={editingBook} onSave={handleFormSave} onCancel={closeForm} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <div className="flex space-x-4 rtl:space-x-reverse">
          <button
            onClick={openCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {t('admin.dashboard.addBook')}
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Title (EN)</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title.en} className="h-12 w-8 object-cover" />
                    ) : (
                      <div className="h-12 w-8 bg-gray-200" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.title.en}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${book.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {book.genre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAvailability(book._id, book.isAvailable)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        book.isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {book.isAvailable ? t('admin.dashboard.available') : t('admin.dashboard.unavailable')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => openEditForm(book)}
                      className="text-indigo-600 hover:text-indigo-900 mx-2"
                    >
                      {t('admin.dashboard.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                    >
                      {t('admin.dashboard.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
