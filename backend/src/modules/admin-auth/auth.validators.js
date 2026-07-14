import { body } from 'express-validator';

export const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
