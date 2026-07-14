import { body, param, query } from 'express-validator';
import { BOOK_GENRES, BOOK_LANGUAGES, TRANSLATION_LANGUAGES } from './book.constants.js';

const localizedTextRules = (fieldName, label) => [
  body(`${fieldName}.en`).trim().notEmpty().withMessage(`English ${label} is required`),
  body(`${fieldName}.ur`).optional().isString().withMessage(`Urdu ${label} must be a string`),
];

export const listPublicBooksValidators = [
  query('lang').optional().isIn(TRANSLATION_LANGUAGES).withMessage('Invalid translation language'),
  query('genre').optional().isIn(BOOK_GENRES).withMessage('Invalid genre'),
  query('language').optional().isIn(BOOK_LANGUAGES).withMessage('Invalid book language'),
  query('available').optional().isBoolean().withMessage('available must be true or false'),
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('search must be between 1 and 100 characters'),
];

export const bookIdValidator = [param('id').isMongoId().withMessage('Invalid book id')];

export const upsertBookValidators = [
  ...localizedTextRules('title', 'title'),
  ...localizedTextRules('description', 'description'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat(),
  body('genre').isIn(BOOK_GENRES).withMessage('Genre is invalid'),
  body('language').isIn(BOOK_LANGUAGES).withMessage('Language is invalid'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean').toBoolean(),
];

export const updateAvailabilityValidators = [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
];
