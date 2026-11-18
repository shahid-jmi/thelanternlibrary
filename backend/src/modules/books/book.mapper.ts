import type { Types } from 'mongoose';
import type { BookLean, CoverImage, LocalizedText } from './book.model.js';
import type { BookGenre, BookLanguage, TranslationLanguage } from './book.constants.js';
import type { ShippingClass, StockStatus } from '../../common/constants/catalog.js';
import { getStockInfo } from '../../common/utils/stock.js';
import { DEFAULT_SETTINGS } from '../settings/settings.model.js';

const DEFAULT_THRESHOLD = DEFAULT_SETTINGS.inventory.defaultLowStockThreshold;

export interface PublicBookDto {
  _id: Types.ObjectId;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  coverImage: CoverImage;
  isAvailable: boolean;
  isFeatured: boolean;
  language: BookLanguage;
  stockStatus: StockStatus;
  // Only set when stock is low ("Only 2 left").
  stockRemaining: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBookDto extends Omit<PublicBookDto, 'title' | 'description'> {
  title: LocalizedText;
  description: LocalizedText;
  stock: number | null;
  lowStockThreshold: number | null;
  shippingClass: ShippingClass | null;
}

const getLocalizedField = (field: LocalizedText, lang: TranslationLanguage): string =>
  field[lang] || field.en || '';

// Defensive default for books created before isFeatured existed — .lean()
// reads don't retroactively apply schema defaults to pre-existing documents.
const isFeaturedOf = (book: BookLean): boolean => book.isFeatured ?? false;

export const toPublicBookDto = (
  book: BookLean,
  lang: TranslationLanguage = 'en',
  defaultLowStockThreshold: number = DEFAULT_THRESHOLD
): PublicBookDto => {
  const stockInfo = getStockInfo(book, defaultLowStockThreshold);
  return {
    _id: book._id,
    title: getLocalizedField(book.title, lang),
    description: getLocalizedField(book.description, lang),
    author: book.author,
    price: book.price,
    genre: book.genre,
    coverImage: book.coverImage,
    isAvailable: book.isAvailable,
    isFeatured: isFeaturedOf(book),
    language: book.language,
    stockStatus: stockInfo.status,
    stockRemaining: stockInfo.remaining,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
};

export const toAdminBookDto = (
  book: BookLean,
  defaultLowStockThreshold: number = DEFAULT_THRESHOLD
): AdminBookDto => {
  const stockInfo = getStockInfo(book, defaultLowStockThreshold);
  return {
    _id: book._id,
    title: book.title,
    description: book.description,
    author: book.author,
    price: book.price,
    genre: book.genre,
    coverImage: book.coverImage,
    isAvailable: book.isAvailable,
    isFeatured: isFeaturedOf(book),
    language: book.language,
    stockStatus: stockInfo.status,
    stockRemaining: stockInfo.remaining,
    stock: book.stock ?? null,
    lowStockThreshold: book.lowStockThreshold ?? null,
    shippingClass: book.shippingClass ?? null,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
};
