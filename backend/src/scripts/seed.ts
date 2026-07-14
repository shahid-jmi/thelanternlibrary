import env from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Book, { type BookAttrs } from '../modules/books/book.model.js';
import { PLACEHOLDER_COVER_URL } from '../modules/books/book.constants.js';

const placeholderCover = { url: PLACEHOLDER_COVER_URL, key: null };

const sampleBooks: BookAttrs[] = [
  {
    title: { en: 'The Alchemist', ur: 'کیمیا گر' },
    description: {
      en: 'A story about a shepherd boy who journeys to the pyramids in search of treasure.',
      ur: 'ایک چرواہے لڑکے کی کہانی جو خزانے کی تلاش میں اہرام مصر کا سفر کرتا ہے۔',
    },
    author: 'Paulo Coelho',
    price: 15.99,
    genre: 'fiction',
    coverImage: placeholderCover,
    isAvailable: true,
    language: 'english',
  },
  {
    title: { en: 'Islamic History', ur: 'تاریخ اسلام' },
    description: {
      en: 'A comprehensive history of the Islamic world.',
      ur: 'اسلامی دنیا کی ایک جامع تاریخ۔',
    },
    author: 'Akbar Shah Najibabadi',
    price: 25.5,
    genre: 'history',
    coverImage: placeholderCover,
    isAvailable: true,
    language: 'urdu',
  },
  {
    title: { en: 'Poems of Rumi', ur: 'رومی کی نظمیں' },
    description: {
      en: 'A collection of profound poetry by Jalaluddin Rumi.',
      ur: 'جلال الدین رومی کی گہری شاعری کا مجموعہ۔',
    },
    author: 'Jalaluddin Rumi',
    price: 12,
    genre: 'poetry',
    coverImage: placeholderCover,
    isAvailable: true,
    language: 'persian',
  },
  {
    title: { en: 'A Brief History of Time' },
    description: {
      en: 'A landmark volume in science writing by one of the great minds of our time.',
    },
    author: 'Stephen Hawking',
    price: 18.99,
    genre: 'science',
    coverImage: placeholderCover,
    isAvailable: true,
    language: 'english',
  },
  {
    title: { en: 'The Little Prince' },
    description: { en: 'A novella about a young prince who visits various planets in space.' },
    author: 'Antoine de Saint-Exupéry',
    price: 10.99,
    genre: 'children',
    coverImage: placeholderCover,
    isAvailable: false,
    language: 'english',
  },
  {
    title: { en: 'Introduction to Algorithms' },
    description: { en: 'A comprehensive textbook on computer algorithms.' },
    author: 'Thomas H. Cormen',
    price: 85,
    genre: 'non-fiction',
    coverImage: placeholderCover,
    isAvailable: true,
    language: 'english',
  },
];

const seed = async (): Promise<void> => {
  await connectDatabase();
  console.log(`Connected to MongoDB at ${env.mongoUri}`);
  await Book.deleteMany({});
  console.log('Cleared existing books');
  await Book.insertMany(sampleBooks);
  console.log('Inserted sample books');
  await disconnectDatabase();
  console.log('Disconnected from MongoDB');
};

seed().catch(async (error: unknown) => {
  console.error('Failed to seed database', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
