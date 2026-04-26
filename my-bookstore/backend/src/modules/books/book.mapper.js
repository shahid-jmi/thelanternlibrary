const getLocalizedField = (field, lang) => field?.[lang] || field?.en || '';

export const toPublicBookDto = (book, lang = 'en') => ({
  _id: book._id,
  title: getLocalizedField(book.title, lang),
  description: getLocalizedField(book.description, lang),
  author: book.author,
  price: book.price,
  genre: book.genre,
  coverImage: book.coverImage,
  isAvailable: book.isAvailable,
  language: book.language,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
});

export const toAdminBookDto = (book) => ({
  _id: book._id,
  title: book.title,
  description: book.description,
  author: book.author,
  price: book.price,
  genre: book.genre,
  coverImage: book.coverImage,
  isAvailable: book.isAvailable,
  language: book.language,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
});
