import AppError from '../../common/errors/AppError.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import type { TranslationLanguage } from '../../common/constants/languages.js';
import * as categoryRepository from './category.repository.js';
import * as productRepository from '../products/product.repository.js';
import {
  toAdminCategoryDto,
  toPublicCategoryDto,
  type AdminCategoryDto,
  type PublicCategoryDto,
} from './category.mapper.js';
import type { UpsertCategoryInput } from './category.validators.js';

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

export const listAdminCategories = async (): Promise<AdminCategoryDto[]> => {
  const categories = await categoryRepository.findAllCategories();
  return categories.map(toAdminCategoryDto);
};

export const createCategory = async (payload: UpsertCategoryInput): Promise<AdminCategoryDto> => {
  await assertSlugAvailable(payload.slug);

  const category = await categoryRepository.createCategory({
    ...payload,
    isActive: payload.isActive ?? true,
  });

  return toAdminCategoryDto(category);
};

export const updateCategory = async (
  id: string,
  payload: UpsertCategoryInput
): Promise<AdminCategoryDto> => {
  const existingCategory = await categoryRepository.findById(id);

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  if (payload.slug !== existingCategory.slug) {
    await assertSlugAvailable(payload.slug, id);
  }

  const updatedCategory = await categoryRepository.updateCategoryById(id, payload);

  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
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
};
