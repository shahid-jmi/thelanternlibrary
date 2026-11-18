import type { Types } from 'mongoose';
import type { LocalizedText } from '../../common/models/localizedText.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import { getLocalizedField } from '../../common/utils/localize.js';
import type { ProductLean } from './product.model.js';
import type { ShippingClass, StockStatus } from '../../common/constants/catalog.js';
import { getStockInfo } from '../../common/utils/stock.js';
import { DEFAULT_SETTINGS } from '../settings/settings.model.js';

const DEFAULT_THRESHOLD = DEFAULT_SETTINGS.inventory.defaultLowStockThreshold;

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
  isFeatured: boolean;
  stockStatus: StockStatus;
  // Only set when stock is low ("Only 2 left").
  stockRemaining: number | null;
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
  stock: number | null;
  lowStockThreshold: number | null;
  // The product's own class; null = inherits the category's.
  shippingClass: ShippingClass | null;
}

// Defensive default for products created before isFeatured existed — .lean()
// reads don't retroactively apply schema defaults to pre-existing documents.
const isFeaturedOf = (product: ProductLean): boolean => product.isFeatured ?? false;

export const toPublicProductDto = (
  product: ProductLean,
  lang: TranslationLanguage = 'en',
  defaultLowStockThreshold: number = DEFAULT_THRESHOLD
): PublicProductDto => {
  const stockInfo = getStockInfo(product, defaultLowStockThreshold);
  return {
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
    isFeatured: isFeaturedOf(product),
    stockStatus: stockInfo.status,
    stockRemaining: stockInfo.remaining,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const toAdminProductDto = (
  product: ProductLean,
  defaultLowStockThreshold: number = DEFAULT_THRESHOLD
): AdminProductDto => {
  const stockInfo = getStockInfo(product, defaultLowStockThreshold);
  return {
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
    isFeatured: isFeaturedOf(product),
    stockStatus: stockInfo.status,
    stockRemaining: stockInfo.remaining,
    stock: product.stock ?? null,
    lowStockThreshold: product.lowStockThreshold ?? null,
    shippingClass: product.shippingClass ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};
