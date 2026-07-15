import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { booleanFromString } from '../../common/validation/booleanFromString.js';
import { localizedText } from '../../common/validation/localizedText.js';
import { TRANSLATION_LANGUAGES } from '../../common/constants/languages.js';
import { CATEGORY_SLUG_MAX_LENGTH } from '../categories/category.constants.js';

export const productIdParamsSchema = z.object({
  id: objectId('Invalid product id'),
});

export const listPublicProductsQuerySchema = z.object({
  lang: z.enum(TRANSLATION_LANGUAGES, { message: 'Invalid translation language' }).default('en'),
  category: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'category must be a category slug')
    .max(CATEGORY_SLUG_MAX_LENGTH, 'category must be a category slug')
    .optional(),
  available: booleanFromString('available must be true or false').optional(),
  search: z
    .string()
    .trim()
    .min(1, 'search must be between 1 and 100 characters')
    .max(100, 'search must be between 1 and 100 characters')
    .optional(),
});

export const getPublicProductQuerySchema = z.object({
  lang: z.enum(TRANSLATION_LANGUAGES, { message: 'Invalid translation language' }).default('en'),
});

export const upsertProductBodySchema = z.object({
  name: localizedText('name'),
  description: localizedText('description'),
  category: objectId('Invalid category id'),
  price: z.coerce
    .number({ message: 'Price must be a positive number' })
    .min(0, 'Price must be a positive number'),
  isAvailable: booleanFromString('isAvailable must be a boolean').optional(),
});

export const updateAvailabilityBodySchema = z.object({
  isAvailable: booleanFromString('isAvailable must be a boolean'),
});

export type ListPublicProductsQuery = z.infer<typeof listPublicProductsQuerySchema>;
export type GetPublicProductQuery = z.infer<typeof getPublicProductQuerySchema>;
export type UpsertProductInput = z.infer<typeof upsertProductBodySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilityBodySchema>;
