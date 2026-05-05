import { validationResult } from 'express-validator';
import ValidationError from '../errors/ValidationError.js';

export const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new ValidationError('Validation failed', errors.array()));
    }

    next();
  },
];

export default validate;
