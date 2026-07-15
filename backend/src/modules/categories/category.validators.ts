import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { booleanFromString } from '../../common/validation/booleanFromString.js';
import { localizedText } from '../../common/validation/localizedText.js';
import { TRANSLATION_LANGUAGES } from '../../common/constants/languages.js';
import { CATEGORY_SLUG_MAX_LENGTH, CATEGORY_SLUG_PATTERN } from './category.constants.js';

export const categoryIdParamsSchema = z.object({
  id: objectId('Invalid category id'),
});

export const listPublicCategoriesQuerySchema = z.object({
  lang: z.enum(TRANSLATION_LANGUAGES, { message: 'Invalid translation language' }).default('en'),
});

export const upsertCategoryBodySchema = z.object({
  name: localizedText('name'),
  slug: z
    .string({ message: 'Slug is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required')
    .max(CATEGORY_SLUG_MAX_LENGTH, `Slug must be at most ${CATEGORY_SLUG_MAX_LENGTH} characters`)
    .regex(
      CATEGORY_SLUG_PATTERN,
      'Slug may only contain lowercase letters, numbers, and single hyphens'
    ),
  tagline: localizedText('tagline').optional(),
  isActive: booleanFromString('isActive must be a boolean').optional(),
});

export type ListPublicCategoriesQuery = z.infer<typeof listPublicCategoriesQuerySchema>;
export type UpsertCategoryInput = z.infer<typeof upsertCategoryBodySchema>;
