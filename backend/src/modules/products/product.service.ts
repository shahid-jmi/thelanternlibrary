import type { FilterQuery } from 'mongoose';
import NotFoundError from '../../common/errors/NotFoundError.js';
import ValidationError from '../../common/errors/ValidationError.js';
import logger from '../../common/utils/logger.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import {
  PLACEHOLDER_COVER_URL,
  uploadCoverImageAsset,
  deleteCoverImageAsset,
} from '../../common/services/cover-image.service.js';
import * as productRepository from './product.repository.js';
import * as categoryRepository from '../categories/category.repository.js';
import {
  toAdminProductDto,
  toPublicProductDto,
  type AdminProductDto,
  type PublicProductDto,
} from './product.mapper.js';
import type { ProductAttrs } from './product.model.js';
import type { ListPublicProductsQuery, UpsertProductInput } from './product.validators.js';

interface UploadedFile {
  buffer: Buffer;
}

// A product may only ever be assigned to a category that exists and is active.
const assertAssignableCategory = async (categoryId: string): Promise<void> => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new ValidationError('Validation failed', [
      { path: 'category', msg: 'Category does not exist' },
    ]);
  }

  if (!category.isActive) {
    throw new ValidationError('Validation failed', [
      { path: 'category', msg: 'Category is inactive; assign an active category' },
    ]);
  }
};

export const listPublicProducts = async (
  filters: ListPublicProductsQuery
): Promise<PublicProductDto[]> => {
  const query: FilterQuery<ProductAttrs> = {};

  if (filters.category) {
    const category = await categoryRepository.findBySlug(filters.category);

    // An unknown or deactivated category has no public products.
    if (!category || !category.isActive) {
      return [];
    }

    query.category = category._id;
  }

  if (filters.available !== undefined) {
    query.isAvailable = filters.available;
  }

  if (filters.search) {
    query.$or = [
      { 'name.en': { $regex: filters.search, $options: 'i' } },
      { 'name.ur': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const products = await productRepository.findPublicProducts(query);
  return products.map((product) => toPublicProductDto(product, filters.lang));
};

export const getPublicProductById = async (
  id: string,
  lang: TranslationLanguage = 'en'
): Promise<PublicProductDto> => {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return toPublicProductDto(product, lang);
};

export const listAdminProducts = async (): Promise<AdminProductDto[]> => {
  const products = await productRepository.findAdminProducts();
  return products.map(toAdminProductDto);
};

export const createProduct = async (
  payload: UpsertProductInput,
  file: UploadedFile | undefined
): Promise<AdminProductDto> => {
  await assertAssignableCategory(payload.category);

  let coverImage: CoverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const product = await productRepository.createProduct({
    ...payload,
    isAvailable: payload.isAvailable ?? true,
    coverImage,
  });

  return toAdminProductDto(product);
};

export const updateProduct = async (
  id: string,
  payload: UpsertProductInput,
  file: UploadedFile | undefined
): Promise<AdminProductDto> => {
  const existingProduct = await productRepository.findById(id);

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  await assertAssignableCategory(payload.category);

  const updatePayload: productRepository.UpdateProductPayload = { ...payload };
  let previousKey: string | null = null;

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    updatePayload.coverImage = { url: uploaded.url, key: uploaded.key };
    previousKey = existingProduct.coverImage?.key ?? null;
  }

  const updatedProduct = await productRepository.updateProductById(id, updatePayload);

  if (!updatedProduct) {
    throw new NotFoundError('Product not found');
  }

  if (previousKey) {
    await deleteCoverImageAsset(previousKey);
  }

  return toAdminProductDto(updatedProduct);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const deletedProduct = await productRepository.deleteProductById(id);

  if (!deletedProduct) {
    throw new NotFoundError('Product not found');
  }

  const key = deletedProduct.coverImage?.key;

  if (key) {
    try {
      await deleteCoverImageAsset(key);
    } catch (error) {
      logger.error(
        { key, err: error },
        'Failed to delete R2 cover image object for deleted product'
      );
    }
  }
};

export const updateAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<AdminProductDto> => {
  const updatedProduct = await productRepository.updateAvailabilityById(id, isAvailable);

  if (!updatedProduct) {
    throw new NotFoundError('Product not found');
  }

  return toAdminProductDto(updatedProduct);
};
