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
import { getDefaultLowStockThreshold } from '../settings/settings.service.js';
import { applyStockFromForm } from '../inventory/inventory.service.js';
import type { Actor } from '../../common/utils/actor.js';

const toAdminDto = async (
  product: Parameters<typeof toAdminProductDto>[0]
): Promise<AdminProductDto> => toAdminProductDto(product, await getDefaultLowStockThreshold());

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

  if (filters.featured !== undefined) {
    query.isFeatured = filters.featured;
  }

  if (filters.search) {
    query.$or = [
      { 'name.en': { $regex: filters.search, $options: 'i' } },
      { 'name.ur': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [products, threshold] = await Promise.all([
    productRepository.findPublicProducts(query),
    getDefaultLowStockThreshold(),
  ]);
  return products.map((product) => toPublicProductDto(product, filters.lang, threshold));
};

export const getPublicProductById = async (
  id: string,
  lang: TranslationLanguage = 'en'
): Promise<PublicProductDto> => {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return toPublicProductDto(product, lang, await getDefaultLowStockThreshold());
};

export const listAdminProducts = async (): Promise<AdminProductDto[]> => {
  const [products, threshold] = await Promise.all([
    productRepository.findAdminProducts(),
    getDefaultLowStockThreshold(),
  ]);
  return products.map((product) => toAdminProductDto(product, threshold));
};

export const createProduct = async (
  payload: UpsertProductInput,
  file: UploadedFile | undefined,
  actor: Actor
): Promise<AdminProductDto> => {
  const { stock = null, ...fields } = payload;
  await assertAssignableCategory(fields.category);

  let coverImage: CoverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const product = await productRepository.createProduct({
    ...fields,
    lowStockThreshold: fields.lowStockThreshold ?? null,
    shippingClass: fields.shippingClass ?? null,
    stock: null,
    isAvailable: fields.isAvailable ?? true,
    isFeatured: fields.isFeatured ?? false,
    coverImage,
  });

  if (stock !== null) {
    await applyStockFromForm(
      { itemType: 'product', _id: product._id, title: product.name.en },
      null,
      stock,
      actor
    );
    product.stock = stock;
  }

  return toAdminDto(product);
};

export const updateProduct = async (
  id: string,
  payload: UpsertProductInput,
  file: UploadedFile | undefined,
  actor: Actor
): Promise<AdminProductDto> => {
  const { stock, ...fields } = payload;
  const existingProduct = await productRepository.findById(id);

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  await assertAssignableCategory(fields.category);

  const updatePayload: productRepository.UpdateProductPayload = { ...fields };
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

  // Stock goes through the inventory service so the change is recorded in
  // the item's stock history. Left out of the form = unchanged.
  if (stock !== undefined && stock !== (existingProduct.stock ?? null)) {
    await applyStockFromForm(
      { itemType: 'product', _id: updatedProduct._id, title: updatedProduct.name.en },
      existingProduct.stock ?? null,
      stock,
      actor
    );
    updatedProduct.stock = stock;
  }

  return toAdminDto(updatedProduct);
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

  return toAdminDto(updatedProduct);
};

export const updateFeatured = async (id: string, isFeatured: boolean): Promise<AdminProductDto> => {
  const updatedProduct = await productRepository.updateFeaturedById(id, isFeatured);

  if (!updatedProduct) {
    throw new NotFoundError('Product not found');
  }

  return toAdminDto(updatedProduct);
};
