import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCreateBook, adminUpdateBook } from '../../api';

const genres = ['fiction', 'non-fiction', 'poetry', 'religious', 'children', 'history', 'science', 'other'];
const languages = ['english', 'urdu', 'persian', 'arabic', 'other'];

const BookForm = ({ book, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: {
      en: book?.title?.en || '',
      ur: book?.title?.ur || '',
      fa: book?.title?.fa || ''
    },
    description: {
      en: book?.description?.en || '',
      ur: book?.description?.ur || '',
      fa: book?.description?.fa || ''
    },
    author: book?.author || '',
    price: book?.price || '',
    genre: book?.genre || '',
    language: book?.language || '',
    coverImage: book?.coverImage || ''
  });
  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      if (book) {
        await adminUpdateBook(book._id, formData);
      } else {
        await adminCreateBook(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving book:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors.map(err => err.msg));
      } else {
        setErrors(['An error occurred while saving']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {book ? t('admin.dashboard.edit') : t('admin.dashboard.addBook')}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <ul className="list-disc pl-5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Titles */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.titleEn')} *</label>
              <input type="text" name="title.en" value={formData.title.en} onChange={handleChange} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.titleUr')}</label>
              <input type="text" name="title.ur" value={formData.title.ur} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.titleFa')}</label>
              <input type="text" name="title.fa" value={formData.title.fa} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="rtl" />
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.author')} *</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.price')} *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.genre')} *</label>
                <select name="genre" value={formData.genre} onChange={handleChange} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">--</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.language')} *</label>
                <select name="language" value={formData.language} onChange={handleChange} required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">--</option>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.coverImage')}</label>
              <input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.descEn')} *</label>
            <textarea name="description.en" value={formData.description.en} onChange={handleChange} required rows="3" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="ltr"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.form.descUr')}</label>
            <textarea name="description.ur" value={formData.description.ur} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" dir="rtl"></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-6 rounded transition-colors">
            {t('admin.form.cancel')}
          </button>
          <button type="submit" disabled={loading} className={`bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
            {loading ? '...' : t('admin.form.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
