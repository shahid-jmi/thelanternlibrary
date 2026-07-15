import type { Types } from 'mongoose';
import type { LocalizedText } from '../../common/models/localizedText.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import { getLocalizedField } from '../../common/utils/localize.js';
import type { ProductLean } from './product.model.js';

export interface PublicProductCategoryDto {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface AdminProductCategoryDto {
  _id: Types.ObjectId;
  name: LocalizedText;
  slug: string;
  isActive: boolean;
}

export interface PublicProductDto {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: PublicProductCategoryDto;
  coverImage: CoverImage;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProductDto extends Omit<
  PublicProductDto,
  'name' | 'description' | 'category'
> {
  name: LocalizedText;
  description: LocalizedText;
  category: AdminProductCategoryDto;
}

export const toPublicProductDto = (
  product: ProductLean,
  lang: TranslationLanguage = 'en'
): PublicProductDto => ({
  _id: product._id,
  name: getLocalizedField(product.name, lang),
  description: getLocalizedField(product.description, lang),
  price: product.price,
  category: {
    _id: product.category._id,
    name: getLocalizedField(product.category.name, lang),
    slug: product.category.slug,
  },
  coverImage: product.coverImage,
  isAvailable: product.isAvailable,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const toAdminProductDto = (product: ProductLean): AdminProductDto => ({
  _id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: {
    _id: product.category._id,
    name: product.category.name,
    slug: product.category.slug,
    isActive: product.category.isActive,
  },
  coverImage: product.coverImage,
  isAvailable: product.isAvailable,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});
