import express from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import uploadCoverImage from '../../common/middleware/uploadCoverImage.js';
import parseJsonFormFields from '../../common/middleware/parseJsonFormFields.js';
import {
  bookIdValidator,
  listPublicBooksValidators,
  updateAvailabilityValidators,
  upsertBookValidators,
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

export const createPublicBookRouter = () => {
  const router = express.Router();

  router.get('/', validate(listPublicBooksValidators), asyncHandler(listPublicBooks));
  router.get('/:id', validate(bookIdValidator), asyncHandler(getPublicBookById));

  return router;
};

export const createAdminBookRouter = () => {
  const router = express.Router();

  router.get('/', asyncHandler(listAdminBooks));
  router.post(
    '/',
    uploadCoverImage,
    parseJsonFormFields(['title', 'description']),
    validate(upsertBookValidators),
    asyncHandler(createBook)
  );
  router.put(
    '/:id',
    uploadCoverImage,
    parseJsonFormFields(['title', 'description']),
    validate([...bookIdValidator, ...upsertBookValidators]),
    asyncHandler(updateBook)
  );
  router.delete('/:id', validate(bookIdValidator), asyncHandler(deleteBook));
  router.patch(
    '/:id/availability',
    validate([...bookIdValidator, ...updateAvailabilityValidators]),
    asyncHandler(updateAvailability)
  );

  return router;
};
