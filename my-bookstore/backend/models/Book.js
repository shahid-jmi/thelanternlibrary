import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ur: { type: String, required: false },
    fa: { type: String, required: false }
  },
  description: {
    en: { type: String, required: true },
    ur: { type: String, required: false },
    fa: { type: String, required: false }
  },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  genre: {
    type: String,
    enum: ['fiction', 'non-fiction', 'poetry', 'religious', 'children', 'history', 'science', 'other'],
    required: true
  },
  coverImage: { type: String, required: false },
  isAvailable: { type: Boolean, default: true },
  language: {
    type: String,
    enum: ['english', 'urdu', 'persian', 'arabic', 'other'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
