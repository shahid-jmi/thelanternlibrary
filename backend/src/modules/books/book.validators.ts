import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { booleanFromString } from '../../common/validation/booleanFromString.js';
import { BOOK_GENRES, BOOK_LANGUAGES, TRANSLATION_LANGUAGES } from './book.constants.js';

const localizedText = (label: string) =>
  z.object({
    en: z
      .string({ message: `English ${label} is required` })
      .trim()
      .min(1, `English ${label} is required`),
    ur: z
      .string({ message: `Urdu ${label} must be a string` })
      .trim()
      .optional(),
  });

export const bookIdParamsSchema = z.object({
  id: objectId('Invalid book id'),
});

export const listPublicBooksQuerySchema = z.object({
  lang: z.enum(TRANSLATION_LANGUAGES, { message: 'Invalid translation language' }).default('en'),
  genre: z.enum(BOOK_GENRES, { message: 'Invalid genre' }).optional(),
  language: z.enum(BOOK_LANGUAGES, { message: 'Invalid book language' }).optional(),
  available: booleanFromString('available must be true or false').optional(),
  search: z
    .string()
    .trim()
    .min(1, 'search must be between 1 and 100 characters')
    .max(100, 'search must be between 1 and 100 characters')
    .optional(),
});

export const getPublicBookQuerySchema = z.object({
  lang: z.enum(TRANSLATION_LANGUAGES, { message: 'Invalid translation language' }).default('en'),
});

export const upsertBookBodySchema = z.object({
  title: localizedText('title'),
  description: localizedText('description'),
  author: z.string({ message: 'Author is required' }).trim().min(1, 'Author is required'),
  price: z.coerce
    .number({ message: 'Price must be a positive number' })
    .min(0, 'Price must be a positive number'),
  genre: z.enum(BOOK_GENRES, { message: 'Genre is invalid' }),
  language: z.enum(BOOK_LANGUAGES, { message: 'Language is invalid' }),
  isAvailable: booleanFromString('isAvailable must be a boolean').optional(),
});

export const updateAvailabilityBodySchema = z.object({
  isAvailable: booleanFromString('isAvailable must be a boolean'),
});

export type ListPublicBooksQuery = z.infer<typeof listPublicBooksQuerySchema>;
export type GetPublicBookQuery = z.infer<typeof getPublicBookQuerySchema>;
export type UpsertBookInput = z.infer<typeof upsertBookBodySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilityBodySchema>;
