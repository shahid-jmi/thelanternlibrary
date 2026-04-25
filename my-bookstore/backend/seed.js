import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';

const sampleBooks = [
  {
    title: { en: 'The Alchemist', ur: 'کیمیا گر', fa: 'کیمیاگر' },
    description: {
      en: 'A story about a shepherd boy who journeys to the pyramids in search of treasure.',
      ur: 'ایک چرواہے لڑکے کی کہانی جو خزانے کی تلاش میں اہرام مصر کا سفر کرتا ہے۔',
      fa: 'داستان چوپانی که برای یافتن گنج به اهرام مصر سفر می‌کند.'
    },
    author: 'Paulo Coelho',
    price: 15.99,
    genre: 'fiction',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: true,
    language: 'english'
  },
  {
    title: { en: 'Islamic History', ur: 'تاریخ اسلام' },
    description: {
      en: 'A comprehensive history of the Islamic world.',
      ur: 'اسلامی دنیا کی ایک جامع تاریخ۔'
    },
    author: 'Akbar Shah Najibabadi',
    price: 25.50,
    genre: 'history',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: true,
    language: 'urdu'
  },
  {
    title: { en: 'Poems of Rumi', ur: 'رومی کی نظمیں' },
    description: {
      en: 'A collection of profound poetry by Jalaluddin Rumi.',
      ur: 'جلال الدین رومی کی گہری شاعری کا مجموعہ۔'
    },
    author: 'Jalaluddin Rumi',
    price: 12.00,
    genre: 'poetry',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: true,
    language: 'persian'
  },
  {
    title: { en: 'A Brief History of Time' },
    description: { en: 'A landmark volume in science writing by one of the great minds of our time.' },
    author: 'Stephen Hawking',
    price: 18.99,
    genre: 'science',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: true,
    language: 'english'
  },
  {
    title: { en: 'The Little Prince' },
    description: { en: 'A novella about a young prince who visits various planets in space.' },
    author: 'Antoine de Saint-Exupéry',
    price: 10.99,
    genre: 'children',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: false,
    language: 'english'
  },
  {
    title: { en: 'Introduction to Algorithms' },
    description: { en: 'A comprehensive textbook on computer algorithms.' },
    author: 'Thomas H. Cormen',
    price: 85.00,
    genre: 'non-fiction',
    coverImage: 'https://via.placeholder.com/150',
    isAvailable: true,
    language: 'english'
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Book.deleteMany({});
    console.log('Cleared existing books');
    await Book.insertMany(sampleBooks);
    console.log('Inserted sample books');
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
