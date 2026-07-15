import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import requireSuperAdmin from '../../common/middleware/requireSuperAdmin.js';
import {
  categoryIdParamsSchema,
  listPublicCategoriesQuerySchema,
  upsertCategoryBodySchema,
} from './category.validators.js';
import {
  createCategory,
  deleteCategory,
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
    validate({ body: upsertCategoryBodySchema }),
    asyncHandler(createCategory)
  );
  router.put(
    '/:id',
    requireSuperAdmin,
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
