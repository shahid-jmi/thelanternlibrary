import type { FilterQuery, SortOrder } from 'mongoose';
import Book, { type BookAttrs, type BookLean } from './book.model.js';

interface FindPublicBooksOptions {
  sort?: Record<string, SortOrder>;
  limit?: number;
  skip?: number;
}

export const findPublicBooks = async (
  query: FilterQuery<BookAttrs>,
  options: FindPublicBooksOptions = {}
): Promise<BookLean[]> => {
  const { sort = { createdAt: -1 }, limit, skip } = options;

  let bookQuery = Book.find(query).sort(sort).lean<BookLean[]>();

  if (typeof skip === 'number' && skip > 0) {
    bookQuery = bookQuery.skip(skip);
  }

  if (typeof limit === 'number' && limit > 0) {
    bookQuery = bookQuery.limit(limit);
  }

  return bookQuery.exec();
};

export const findById = async (id: string): Promise<BookLean | null> =>
  Book.findById(id).lean<BookLean>().exec();

export const findAdminBooks = async (): Promise<BookLean[]> =>
  Book.find().sort({ createdAt: -1 }).lean<BookLean[]>().exec();

export const createBook = async (
  payload: BookAttrs | Omit<BookAttrs, 'isAvailable'>
): Promise<BookLean> => {
  const created = await Book.create(payload);
  return created.toObject() as unknown as BookLean;
};

export const updateBookById = async (
  id: string,
  payload: Partial<BookAttrs>
): Promise<BookLean | null> =>
  Book.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean<BookLean>()
    .exec();

export const deleteBookById = async (id: string): Promise<BookLean | null> =>
  Book.findByIdAndDelete(id).lean<BookLean>().exec();

export const updateAvailabilityById = async (
  id: string,
  isAvailable: boolean
): Promise<BookLean | null> =>
  Book.findByIdAndUpdate(
    id,
    { isAvailable },
    {
      new: true,
      runValidators: true,
    }
  )
    .lean<BookLean>()
    .exec();
