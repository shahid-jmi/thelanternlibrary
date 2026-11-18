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
import { getDefaultLowStockThreshold } from '../settings/settings.service.js';
import { applyStockFromForm } from '../inventory/inventory.service.js';
import type { Actor } from '../../common/utils/actor.js';

interface UploadedFile {
  buffer: Buffer;
}

const buildPublicBookQuery = ({
  genre,
  language,
  available,
  featured,
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

  if (featured !== undefined) {
    query.isFeatured = featured;
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
  const [books, threshold] = await Promise.all([
    bookRepository.findPublicBooks(query),
    getDefaultLowStockThreshold(),
  ]);
  return books.map((book) => toPublicBookDto(book, filters.lang, threshold));
};

export const getPublicBookById = async (
  id: string,
  lang: TranslationLanguage = 'en'
): Promise<PublicBookDto> => {
  const book = await bookRepository.findById(id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  return toPublicBookDto(book, lang, await getDefaultLowStockThreshold());
};

export const listAdminBooks = async (): Promise<AdminBookDto[]> => {
  const [books, threshold] = await Promise.all([
    bookRepository.findAdminBooks(),
    getDefaultLowStockThreshold(),
  ]);
  return books.map((book) => toAdminBookDto(book, threshold));
};

const toAdminDto = async (book: Parameters<typeof toAdminBookDto>[0]): Promise<AdminBookDto> =>
  toAdminBookDto(book, await getDefaultLowStockThreshold());

export const createBook = async (
  payload: UpsertBookInput,
  file: UploadedFile | undefined,
  actor: Actor
): Promise<AdminBookDto> => {
  const { stock = null, ...fields } = payload;
  let coverImage: CoverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const book = await bookRepository.createBook({
    ...fields,
    lowStockThreshold: fields.lowStockThreshold ?? null,
    shippingClass: fields.shippingClass ?? null,
    stock: null,
    isAvailable: fields.isAvailable ?? true,
    isFeatured: fields.isFeatured ?? false,
    coverImage,
  });

  if (stock !== null) {
    await applyStockFromForm(
      { itemType: 'book', _id: book._id, title: book.title.en },
      null,
      stock,
      actor
    );
    book.stock = stock;
  }

  return toAdminDto(book);
};

export const updateBook = async (
  id: string,
  payload: UpsertBookInput,
  file: UploadedFile | undefined,
  actor: Actor
): Promise<AdminBookDto> => {
  const { stock, ...fields } = payload;
  const existingBook = await bookRepository.findById(id);

  if (!existingBook) {
    throw new NotFoundError('Book not found');
  }

  const updatePayload: Partial<BookAttrs> = { ...fields };
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

  // Stock goes through the inventory service so the change is recorded in
  // the item's stock history. Left out of the form = unchanged.
  if (stock !== undefined && stock !== (existingBook.stock ?? null)) {
    await applyStockFromForm(
      { itemType: 'book', _id: updatedBook._id, title: updatedBook.title.en },
      existingBook.stock ?? null,
      stock,
      actor
    );
    updatedBook.stock = stock;
  }

  return toAdminDto(updatedBook);
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

  return toAdminDto(updatedBook);
};

export const updateFeatured = async (id: string, isFeatured: boolean): Promise<AdminBookDto> => {
  const updatedBook = await bookRepository.updateFeaturedById(id, isFeatured);

  if (!updatedBook) {
    throw new NotFoundError('Book not found');
  }

  return toAdminDto(updatedBook);
};
