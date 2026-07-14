import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import uploadCoverImage from '../../common/middleware/uploadCoverImage.js';
import parseJsonFormFields from '../../common/middleware/parseJsonFormFields.js';
import {
  bookIdParamsSchema,
  getPublicBookQuerySchema,
  listPublicBooksQuerySchema,
  updateAvailabilityBodySchema,
  upsertBookBodySchema,
} from './book.validators.js';
import {
  createBook,
  deleteBook,
  getPublicBookById,
  listAdminBooks,
  listPublicBooks,
  updateAvailability,
  updateBook,
} from './book.controller.js';

export const createPublicBookRouter = (): Router => {
  const router = express.Router();

  router.get('/', validate({ query: listPublicBooksQuerySchema }), asyncHandler(listPublicBooks));
  router.get(
    '/:id',
    validate({ params: bookIdParamsSchema, query: getPublicBookQuerySchema }),
    asyncHandler(getPublicBookById)
  );

  return router;
};

export const createAdminBookRouter = (): Router => {
  const router = express.Router();

  router.get('/', asyncHandler(listAdminBooks));
  router.post(
    '/',
    uploadCoverImage,
    parseJsonFormFields(['title', 'description']),
    validate({ body: upsertBookBodySchema }),
    asyncHandler(createBook)
  );
  router.put(
    '/:id',
    uploadCoverImage,
    parseJsonFormFields(['title', 'description']),
    validate({ params: bookIdParamsSchema, body: upsertBookBodySchema }),
    asyncHandler(updateBook)
  );
  router.delete('/:id', validate({ params: bookIdParamsSchema }), asyncHandler(deleteBook));
  router.patch(
    '/:id/availability',
    validate({ params: bookIdParamsSchema, body: updateAvailabilityBodySchema }),
    asyncHandler(updateAvailability)
  );

  return router;
};
