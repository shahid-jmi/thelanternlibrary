import type { Types } from 'mongoose';
import type { LocalizedText } from '../../common/models/localizedText.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import { getLocalizedField } from '../../common/utils/localize.js';
import { PLACEHOLDER_COVER_URL } from '../../common/services/cover-image.service.js';
import type { CategoryLean } from './category.model.js';

// Defensive default for categories created before coverImage existed.
const coverImageOf = (category: CategoryLean): CoverImage =>
  category.coverImage ?? { url: PLACEHOLDER_COVER_URL, key: null };

export interface PublicCategoryDto {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImage: CoverImage;
}

export interface AdminCategoryDto {
  _id: Types.ObjectId;
  name: LocalizedText;
  slug: string;
  tagline: LocalizedText | null;
  description: LocalizedText | null;
  coverImage: CoverImage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const toPublicCategoryDto = (
  category: CategoryLean,
  lang: TranslationLanguage = 'en'
): PublicCategoryDto => ({
  _id: category._id,
  name: getLocalizedField(category.name, lang),
  slug: category.slug,
  tagline: category.tagline ? getLocalizedField(category.tagline, lang) : null,
  description: category.description ? getLocalizedField(category.description, lang) : null,
  coverImage: coverImageOf(category),
});

export const toAdminCategoryDto = (category: CategoryLean): AdminCategoryDto => ({
  _id: category._id,
  name: category.name,
  slug: category.slug,
  tagline: category.tagline ?? null,
  description: category.description ?? null,
  coverImage: coverImageOf(category),
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});
