import type { Types } from 'mongoose';
import type { BookLean, CoverImage, LocalizedText } from './book.model.js';
import type { BookGenre, BookLanguage, TranslationLanguage } from './book.constants.js';

export interface PublicBookDto {
  _id: Types.ObjectId;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  coverImage: CoverImage;
  isAvailable: boolean;
  language: BookLanguage;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBookDto extends Omit<PublicBookDto, 'title' | 'description'> {
  title: LocalizedText;
  description: LocalizedText;
}

const getLocalizedField = (field: LocalizedText, lang: TranslationLanguage): string =>
  field[lang] || field.en || '';

export const toPublicBookDto = (
  book: BookLean,
  lang: TranslationLanguage = 'en'
): PublicBookDto => ({
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

export const toAdminBookDto = (book: BookLean): AdminBookDto => ({
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
