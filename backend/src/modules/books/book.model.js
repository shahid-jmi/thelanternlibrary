import mongoose from 'mongoose';
import { BOOK_GENRES, BOOK_LANGUAGES } from './book.constants.js';

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    ur: { type: String, trim: true },
    fa: { type: String, trim: true },
  },
  { _id: false }
);

const coverImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
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
