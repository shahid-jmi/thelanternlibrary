import type { FilterQuery } from 'mongoose';
import NotFoundError from '../../common/errors/NotFoundError.js';
import logger from '../../common/utils/logger.js';
import * as bookRepository from './book.repository.js';
import {
  toAdminBookDto,
  toPublicBookDto,
  type AdminBookDto,
  type PublicBookDto,
} from './book.mapper.js';
import {
  PLACEHOLDER_COVER_URL,
  uploadCoverImageAsset,
  deleteCoverImageAsset,
} from '../../common/services/cover-image.service.js';
import type { TranslationLanguage } from './book.constants.js';
import type { BookAttrs, CoverImage } from './book.model.js';
import type { ListPublicBooksQuery, UpsertBookInput } from './book.validators.js';

interface UploadedFile {
  buffer: Buffer;
}

const buildPublicBookQuery = ({
  genre,
  language,
  available,
  search,
}: ListPublicBooksQuery): FilterQuery<BookAttrs> => {
  const query: FilterQuery<BookAttrs> = {};

  if (genre) {
    query.genre = genre;
  }

  if (language) {
    query.language = language;
  }

  if (available !== undefined) {
    query.isAvailable = available;
  }

  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'title.ur': { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

export const listPublicBooks = async (filters: ListPublicBooksQuery): Promise<PublicBookDto[]> => {
  const query = buildPublicBookQuery(filters);
  const books = await bookRepository.findPublicBooks(query);
  return books.map((book) => toPublicBookDto(book, filters.lang));
};

export const getPublicBookById = async (
  id: string,
  lang: TranslationLanguage = 'en'
): Promise<PublicBookDto> => {
  const book = await bookRepository.findById(id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  return toPublicBookDto(book, lang);
};

export const listAdminBooks = async (): Promise<AdminBookDto[]> => {
  const books = await bookRepository.findAdminBooks();
  return books.map(toAdminBookDto);
};

export const createBook = async (
  payload: UpsertBookInput,
  file: UploadedFile | undefined
): Promise<AdminBookDto> => {
  let coverImage: CoverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const book = await bookRepository.createBook({
    ...payload,
    isAvailable: payload.isAvailable ?? true,
    coverImage,
  });
  return toAdminBookDto(book);
};

export const updateBook = async (
  id: string,
  payload: UpsertBookInput,
  file: UploadedFile | undefined
): Promise<AdminBookDto> => {
  const existingBook = await bookRepository.findById(id);

  if (!existingBook) {
    throw new NotFoundError('Book not found');
  }

  const updatePayload: Partial<BookAttrs> = { ...payload };
  let previousKey: string | null = null;

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

export const deleteBook = async (id: string): Promise<void> => {
  const deletedBook = await bookRepository.deleteBookById(id);

  if (!deletedBook) {
    throw new NotFoundError('Book not found');
  }

  const key = deletedBook.coverImage?.key;

  if (key) {
    try {
      await deleteCoverImageAsset(key);
    } catch (error) {
      logger.error({ key, err: error }, 'Failed to delete R2 cover image object for deleted book');
    }
  }
};

export const updateAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<AdminBookDto> => {
  const updatedBook = await bookRepository.updateAvailabilityById(id, isAvailable);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  return toAdminBookDto(updatedBook);
};
