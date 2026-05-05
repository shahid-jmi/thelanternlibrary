import Book from './book.model.js';

export const findPublicBooks = async (query, options = {}) => {
  const { sort = { createdAt: -1 }, limit, skip } = options;

  let bookQuery = Book.find(query).sort(sort).lean();

  if (typeof skip === 'number' && skip > 0) {
    bookQuery = bookQuery.skip(skip);
  }

  if (typeof limit === 'number' && limit > 0) {
    bookQuery = bookQuery.limit(limit);
  }

  return bookQuery.exec();
};

export const findById = async (id) => Book.findById(id).lean().exec();

export const findAdminBooks = async () => Book.find().sort({ createdAt: -1 }).lean().exec();

export const createBook = async (payload) => {
  const created = await Book.create(payload);
  return created.toObject();
};

export const updateBookById = async (id, payload) =>
  Book.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    lean: true,
  }).exec();

export const deleteBookById = async (id) =>
  Book.findByIdAndDelete(id, {
    lean: true,
  }).exec();

export const updateAvailabilityById = async (id, isAvailable) =>
  Book.findByIdAndUpdate(
    id,
    { isAvailable },
    {
      new: true,
      runValidators: true,
      lean: true,
    }
  ).exec();
