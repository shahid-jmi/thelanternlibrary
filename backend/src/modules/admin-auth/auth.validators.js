import { body } from 'express-validator';

export const loginValidators = [
  body('password').isString().notEmpty().withMessage('Password is required'),
];
