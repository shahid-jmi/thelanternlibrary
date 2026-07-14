import mongoose, { Schema, type Types } from 'mongoose';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  type BookGenre,
  type BookLanguage,
} from './book.constants.js';

export interface LocalizedText {
  en: string;
  ur?: string;
}

export interface CoverImage {
  url: string;
  key: string | null;
}

export interface BookAttrs {
  title: LocalizedText;
  description: LocalizedText;
  author: string;
  price: number;
  genre: BookGenre;
  coverImage: CoverImage;
  isAvailable: boolean;
  language: BookLanguage;
}

export interface BookLean extends BookAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const localizedTextSchema = new Schema<LocalizedText>(
  {
    en: { type: String, required: true, trim: true },
    ur: { type: String, trim: true },
  },
  { _id: false }
);

const coverImageSchema = new Schema<CoverImage>(
  {
    url: { type: String, required: true },
    key: { type: String, default: null },
  },
  { _id: false }
);

const bookSchema = new Schema<BookAttrs>(
  {
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    genre: { type: String, enum: BOOK_GENRES, required: true },
    coverImage: { type: coverImageSchema, required: true },
    isAvailable: { type: Boolean, default: true },
    language: { type: String, enum: BOOK_LANGUAGES, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookSchema.index({ genre: 1, language: 1, isAvailable: 1 });
bookSchema.index({ 'title.en': 1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;
