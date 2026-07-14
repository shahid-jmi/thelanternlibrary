import { body, param } from 'express-validator';
import { ADMIN_ROLES } from './admin.constants.js';

export const adminIdValidator = [param('id').isMongoId().withMessage('Invalid admin id')];

export const createAdminValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(ADMIN_ROLES).withMessage('Role must be either "admin" or "super_admin"'),
];

export const updateRoleValidators = [
  body('role').isIn(ADMIN_ROLES).withMessage('Role must be either "admin" or "super_admin"'),
];
