import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { toAdminBookDto, toPublicBookDto } from './book.mapper.js';
import type { BookLean } from './book.model.js';

const baseBook: BookLean = {
  _id: new Types.ObjectId(),
  title: { en: 'The Alchemist', ur: 'کیمیا گر' },
  description: { en: 'An English description', ur: 'اردو تفصیل' },
  author: 'Paulo Coelho',
  price: 15.99,
  genre: 'fiction',
  coverImage: { url: 'https://covers.test.example.com/covers/x.webp', key: 'covers/x.webp' },
  isAvailable: true,
  language: 'english',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('toPublicBookDto', () => {
  it('localizes title and description to the requested language', () => {
    const dto = toPublicBookDto(baseBook, 'ur');
    expect(dto.title).toBe('کیمیا گر');
    expect(dto.description).toBe('اردو تفصیل');
  });

  it('falls back to English when the requested translation is missing', () => {
    const book: BookLean = {
      ...baseBook,
      title: { en: 'English only' },
      description: { en: 'English only description' },
    };
    const dto = toPublicBookDto(book, 'ur');
    expect(dto.title).toBe('English only');
    expect(dto.description).toBe('English only description');
  });

  it('defaults to English', () => {
    const dto = toPublicBookDto(baseBook);
    expect(dto.title).toBe('The Alchemist');
  });
});

describe('toAdminBookDto', () => {
  it('preserves the full localized objects', () => {
    const dto = toAdminBookDto(baseBook);
    expect(dto.title).toEqual({ en: 'The Alchemist', ur: 'کیمیا گر' });
    expect(dto.description).toEqual({ en: 'An English description', ur: 'اردو تفصیل' });
    expect(dto.coverImage.key).toBe('covers/x.webp');
  });
});
