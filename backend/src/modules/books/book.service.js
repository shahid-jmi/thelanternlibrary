import NotFoundError from '../../common/errors/NotFoundError.js';
import logger from '../../common/utils/logger.js';
import * as bookRepository from './book.repository.js';
import { toAdminBookDto, toPublicBookDto } from './book.mapper.js';
import { uploadCoverImageAsset, deleteCoverImageAsset } from './cover-image.service.js';
import { PLACEHOLDER_COVER_URL } from './book.constants.js';

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

export const createBook = async (payload, file) => {
  let coverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const book = await bookRepository.createBook({ ...payload, coverImage });
  return toAdminBookDto(book);
};

export const updateBook = async (id, payload, file) => {
  const existingBook = await bookRepository.findById(id);

  if (!existingBook) {
    throw new NotFoundError('Book not found');
  }

  const updatePayload = { ...payload };
  let previousKey = null;

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    updatePayload.coverImage = { url: uploaded.url, key: uploaded.key };
    previousKey = existingBook.coverImage?.key ?? null;
  }

  const updatedBook = await bookRepository.updateBookById(id, updatePayload);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  if (previousKey) {
    await deleteCoverImageAsset(previousKey);
  }

  return toAdminBookDto(updatedBook);
};

export const deleteBook = async (id) => {
  const deletedBook = await bookRepository.deleteBookById(id);

  if (!deletedBook) {
    throw new NotFoundError('Book not found');
  }

  const key = deletedBook.coverImage?.key;

  if (key) {
    try {
      await deleteCoverImageAsset(key);
    } catch (error) {
      logger.error('Failed to delete R2 cover image object for deleted book', { key, error: error.message });
    }
  }
};

export const updateAvailability = async (id, isAvailable) => {
  const updatedBook = await bookRepository.updateAvailabilityById(id, isAvailable);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  return toAdminBookDto(updatedBook);
};
