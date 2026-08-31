import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import requireSuperAdmin from '../../common/middleware/requireSuperAdmin.js';
import uploadCoverImage from '../../common/middleware/uploadCoverImage.js';
import parseJsonFormFields from '../../common/middleware/parseJsonFormFields.js';
import {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  getPublicCategoryQuerySchema,
  listPublicCategoriesQuerySchema,
  upsertCategoryBodySchema,
} from './category.validators.js';
import {
  createCategory,
  deleteCategory,
  getPublicCategoryBySlug,
  listAdminCategories,
  listPublicCategories,
  updateCategory,
} from './category.controller.js';

export const createPublicCategoryRouter = (): Router => {
  const router = express.Router();

  router.get(
    '/',
    validate({ query: listPublicCategoriesQuerySchema }),
    asyncHandler(listPublicCategories)
  );
  router.get(
    '/:slug',
    validate({ params: categorySlugParamsSchema, query: getPublicCategoryQuerySchema }),
    asyncHandler(getPublicCategoryBySlug)
  );

  return router;
};

export const createAdminCategoryRouter = (): Router => {
  const router = express.Router();

  // Any authenticated admin may view categories (they need the list to assign
  // products); only super admins may change the taxonomy itself.
  router.get('/', asyncHandler(listAdminCategories));
  router.post(
    '/',
    requireSuperAdmin,
    uploadCoverImage,
    parseJsonFormFields(['name', 'tagline', 'description']),
    validate({ body: upsertCategoryBodySchema }),
    asyncHandler(createCategory)
  );
  router.put(
    '/:id',
    requireSuperAdmin,
    uploadCoverImage,
    parseJsonFormFields(['name', 'tagline', 'description']),
    validate({ params: categoryIdParamsSchema, body: upsertCategoryBodySchema }),
    asyncHandler(updateCategory)
  );
  router.delete(
    '/:id',
    requireSuperAdmin,
    validate({ params: categoryIdParamsSchema }),
    asyncHandler(deleteCategory)
  );

  return router;
};
