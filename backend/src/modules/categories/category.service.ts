import AppError from '../../common/errors/AppError.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import logger from '../../common/utils/logger.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import {
  PLACEHOLDER_COVER_URL,
  uploadCoverImageAsset,
  deleteCoverImageAsset,
} from '../../common/services/cover-image.service.js';
import * as categoryRepository from './category.repository.js';
import type { CategoryAttrs } from './category.model.js';
import * as productRepository from '../products/product.repository.js';
import {
  toAdminCategoryDto,
  toPublicCategoryDto,
  type AdminCategoryDto,
  type PublicCategoryDto,
} from './category.mapper.js';
import type { UpsertCategoryInput } from './category.validators.js';

interface UploadedFile {
  buffer: Buffer;
}

const assertSlugAvailable = async (slug: string, excludeId?: string): Promise<void> => {
  const existing = await categoryRepository.findBySlug(slug);

  if (existing && existing._id.toString() !== excludeId) {
    throw new AppError('A category with this slug already exists', 409);
  }
};

export const listPublicCategories = async (
  lang: TranslationLanguage = 'en'
): Promise<PublicCategoryDto[]> => {
  const categories = await categoryRepository.findActiveCategories();
  return categories.map((category) => toPublicCategoryDto(category, lang));
};

export const getPublicCategoryBySlug = async (
  slug: string,
  lang: TranslationLanguage = 'en'
): Promise<PublicCategoryDto> => {
  const category = await categoryRepository.findBySlug(slug);

  // An inactive category is treated as not found for public consumers, same
  // as an unknown one — it shouldn't be reachable once deactivated.
  if (!category || !category.isActive) {
    throw new NotFoundError('Category not found');
  }

  return toPublicCategoryDto(category, lang);
};

export const listAdminCategories = async (): Promise<AdminCategoryDto[]> => {
  const categories = await categoryRepository.findAllCategories();
  return categories.map(toAdminCategoryDto);
};

export const createCategory = async (
  payload: UpsertCategoryInput,
  file: UploadedFile | undefined
): Promise<AdminCategoryDto> => {
  await assertSlugAvailable(payload.slug);

  let coverImage: CoverImage = { url: PLACEHOLDER_COVER_URL, key: null };

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    coverImage = { url: uploaded.url, key: uploaded.key };
  }

  const category = await categoryRepository.createCategory({
    ...payload,
    isActive: payload.isActive ?? true,
    coverImage,
  });

  return toAdminCategoryDto(category);
};

export const updateCategory = async (
  id: string,
  payload: UpsertCategoryInput,
  file: UploadedFile | undefined
): Promise<AdminCategoryDto> => {
  const existingCategory = await categoryRepository.findById(id);

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  if (payload.slug !== existingCategory.slug) {
    await assertSlugAvailable(payload.slug, id);
  }

  const updatePayload: Partial<CategoryAttrs> = { ...payload };
  let previousKey: string | null = null;

  if (file) {
    const uploaded = await uploadCoverImageAsset(file.buffer);
    updatePayload.coverImage = { url: uploaded.url, key: uploaded.key };
    previousKey = existingCategory.coverImage?.key ?? null;
  }

  const updatedCategory = await categoryRepository.updateCategoryById(id, updatePayload);

  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
  }

  if (previousKey) {
    await deleteCoverImageAsset(previousKey);
  }

  return toAdminCategoryDto(updatedCategory);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const existingCategory = await categoryRepository.findById(id);

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  const assignedProducts = await productRepository.countByCategoryId(id);

  if (assignedProducts > 0) {
    throw new AppError(
      `This category still has ${assignedProducts} product${
        assignedProducts === 1 ? '' : 's'
      } assigned. Reassign or remove those products first.`,
      409
    );
  }

  const deletedCategory = await categoryRepository.deleteCategoryById(id);

  if (!deletedCategory) {
    throw new NotFoundError('Category not found');
  }

  const key = deletedCategory.coverImage?.key;

  if (key) {
    try {
      await deleteCoverImageAsset(key);
    } catch (error) {
      logger.error(
        { key, err: error },
        'Failed to delete R2 cover image object for deleted category'
      );
    }
  }
};
