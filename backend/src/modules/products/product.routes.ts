import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import uploadCoverImage from '../../common/middleware/uploadCoverImage.js';
import parseJsonFormFields from '../../common/middleware/parseJsonFormFields.js';
import {
  getPublicProductQuerySchema,
  listPublicProductsQuerySchema,
  productIdParamsSchema,
  updateAvailabilityBodySchema,
  updateFeaturedBodySchema,
  upsertProductBodySchema,
} from './product.validators.js';
import {
  createProduct,
  deleteProduct,
  getPublicProductById,
  listAdminProducts,
  listPublicProducts,
  updateAvailability,
  updateFeatured,
  updateProduct,
} from './product.controller.js';

export const createPublicProductRouter = (): Router => {
  const router = express.Router();

  router.get(
    '/',
    validate({ query: listPublicProductsQuerySchema }),
    asyncHandler(listPublicProducts)
  );
  router.get(
    '/:id',
    validate({ params: productIdParamsSchema, query: getPublicProductQuerySchema }),
    asyncHandler(getPublicProductById)
  );

  return router;
};

export const createAdminProductRouter = (): Router => {
  const router = express.Router();

  router.get('/', asyncHandler(listAdminProducts));
  router.post(
    '/',
    uploadCoverImage,
    parseJsonFormFields(['name', 'description']),
    validate({ body: upsertProductBodySchema }),
    asyncHandler(createProduct)
  );
  router.put(
    '/:id',
    uploadCoverImage,
    parseJsonFormFields(['name', 'description']),
    validate({ params: productIdParamsSchema, body: upsertProductBodySchema }),
    asyncHandler(updateProduct)
  );
  router.delete('/:id', validate({ params: productIdParamsSchema }), asyncHandler(deleteProduct));
  router.patch(
    '/:id/availability',
    validate({ params: productIdParamsSchema, body: updateAvailabilityBodySchema }),
    asyncHandler(updateAvailability)
  );
  router.patch(
    '/:id/featured',
    validate({ params: productIdParamsSchema, body: updateFeaturedBodySchema }),
    asyncHandler(updateFeatured)
  );

  return router;
};
