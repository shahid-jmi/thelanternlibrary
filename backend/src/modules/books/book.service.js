import NotFoundError from '../../common/errors/NotFoundError.js';
import * as bookRepository from './book.repository.js';
import { toAdminBookDto, toPublicBookDto } from './book.mapper.js';

const buildPublicBookQuery = ({ genre, language, available, search }) => {
  const query = {};

  if (genre) {
    query.genre = genre;
  }

  if (language) {
    query.language = language;
  }

  if (available !== undefined) {
    query.isAvailable = available === 'true';
  }

  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'title.ur': { $regex: search, $options: 'i' } },
      { 'title.fa': { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

export const listPublicBooks = async (filters) => {
  const lang = filters.lang || 'en';
  const query = buildPublicBookQuery(filters);
  const books = await bookRepository.findPublicBooks(query);
  return books.map((book) => toPublicBookDto(book, lang));
};

export const getPublicBookById = async (id, lang = 'en') => {
  const book = await bookRepository.findById(id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  return toPublicBookDto(book, lang);
};

export const listAdminBooks = async () => {
  const books = await bookRepository.findAdminBooks();
  return books.map(toAdminBookDto);
};

export const createBook = async (payload) => {
  const book = await bookRepository.createBook(payload);
  return toAdminBookDto(book);
};

export const updateBook = async (id, payload) => {
  const updatedBook = await bookRepository.updateBookById(id, payload);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  return toAdminBookDto(updatedBook);
};

export const deleteBook = async (id) => {
  const deletedBook = await bookRepository.deleteBookById(id);

  if (!deletedBook) {
    throw new NotFoundError('Book not found');
  }
};

export const updateAvailability = async (id, isAvailable) => {
  const updatedBook = await bookRepository.updateAvailabilityById(id, isAvailable);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  return toAdminBookDto(updatedBook);
};
