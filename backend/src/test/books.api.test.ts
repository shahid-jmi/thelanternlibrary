import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import createApp from '../app.js';
import Book from '../modules/books/book.model.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const seedBooks = () =>
  Book.create(
    {
      title: { en: 'The Alchemist', ur: 'کیمیا گر' },
      description: { en: 'A story about a shepherd boy.', ur: 'ایک چرواہے لڑکے کی کہانی۔' },
      author: 'Paulo Coelho',
      price: 15.99,
      genre: 'fiction',
      coverImage: { url: 'https://covers.test.example.com/a.webp', key: null },
      isAvailable: true,
      language: 'english',
    },
    {
      title: { en: 'Islamic History' },
      description: { en: 'A comprehensive history.' },
      author: 'Akbar Shah Najibabadi',
      price: 25.5,
      genre: 'history',
      coverImage: { url: 'https://covers.test.example.com/b.webp', key: null },
      isAvailable: false,
      language: 'urdu',
    }
  );

beforeAll(async () => {
  await startTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

describe('GET /api/v1/books', () => {
  it('returns all books with localized string titles', async () => {
    await seedBooks();

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(typeof response.body[0].title).toBe('string');
  });

  it('localizes to Urdu with English fallback', async () => {
    await seedBooks();

    const response = await request(app).get('/api/v1/books').query({ lang: 'ur' });

    expect(response.status).toBe(200);
    const titles = response.body.map((book: { title: string }) => book.title);
    expect(titles).toContain('کیمیا گر');
    expect(titles).toContain('Islamic History');
  });

  it('filters by genre and availability', async () => {
    await seedBooks();

    const byGenre = await request(app).get('/api/v1/books').query({ genre: 'fiction' });
    expect(byGenre.body).toHaveLength(1);
    expect(byGenre.body[0].author).toBe('Paulo Coelho');

    const available = await request(app).get('/api/v1/books').query({ available: 'true' });
    expect(available.body).toHaveLength(1);
    expect(available.body[0].isAvailable).toBe(true);
  });

  it('rejects an invalid genre with details', async () => {
    const response = await request(app).get('/api/v1/books').query({ genre: 'cooking' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details[0].msg).toBe('Invalid genre');
  });
});

describe('GET /api/v1/books/:id', () => {
  it('returns a single localized book', async () => {
    const [book] = await seedBooks();

    const response = await request(app).get(`/api/v1/books/${book._id.toString()}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('The Alchemist');
  });

  it('returns 404 for a missing book', async () => {
    const response = await request(app).get(`/api/v1/books/${new Types.ObjectId().toString()}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Book not found');
  });

  it('returns 400 for a malformed id', async () => {
    const response = await request(app).get('/api/v1/books/not-an-id');

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Invalid book id');
  });
});
