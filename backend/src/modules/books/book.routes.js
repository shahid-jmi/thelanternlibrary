import express from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
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
  router.post('/', validate(upsertBookValidators), asyncHandler(createBook));
  router.put('/:id', validate([...bookIdValidator, ...upsertBookValidators]), asyncHandler(updateBook));
  router.delete('/:id', validate(bookIdValidator), asyncHandler(deleteBook));
  router.patch(
    '/:id/availability',
    validate([...bookIdValidator, ...updateAvailabilityValidators]),
    asyncHandler(updateAvailability)
  );

  return router;
};
