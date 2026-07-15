import type { Types } from 'mongoose';
import type { LocalizedText } from '../../common/models/localizedText.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import { getLocalizedField } from '../../common/utils/localize.js';
import type { CategoryLean } from './category.model.js';

export interface PublicCategoryDto {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  tagline: string | null;
}

export interface AdminCategoryDto {
  _id: Types.ObjectId;
  name: LocalizedText;
  slug: string;
  tagline: LocalizedText | null;
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
});

export const toAdminCategoryDto = (category: CategoryLean): AdminCategoryDto => ({
  _id: category._id,
  name: category.name,
  slug: category.slug,
  tagline: category.tagline ?? null,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});
