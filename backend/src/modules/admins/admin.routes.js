import express from 'express';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import { adminIdValidator, createAdminValidators, updateRoleValidators } from './admin.validators.js';
import {
  createAdmin,
  deactivateAdmin,
  deleteAdmin,
  listAdmins,
  reactivateAdmin,
  updateAdminRole,
} from './admin.controller.js';

export const createAdminManagementRouter = () => {
  const router = express.Router();

  router.get('/', asyncHandler(listAdmins));
  router.post('/', validate(createAdminValidators), asyncHandler(createAdmin));
  router.delete('/:id', validate(adminIdValidator), asyncHandler(deleteAdmin));
  router.patch('/:id/deactivate', validate(adminIdValidator), asyncHandler(deactivateAdmin));
  router.patch('/:id/reactivate', validate(adminIdValidator), asyncHandler(reactivateAdmin));
  router.patch(
    '/:id/role',
    validate([...adminIdValidator, ...updateRoleValidators]),
    asyncHandler(updateAdminRole)
  );

  return router;
};
