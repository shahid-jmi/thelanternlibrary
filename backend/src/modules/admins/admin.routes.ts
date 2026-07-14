import express, { type Router } from 'express';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import {
  adminIdParamsSchema,
  createAdminBodySchema,
  updateRoleBodySchema,
} from './admin.validators.js';
import {
  createAdmin,
  deactivateAdmin,
  deleteAdmin,
  listAdmins,
  reactivateAdmin,
  updateAdminRole,
} from './admin.controller.js';

export const createAdminManagementRouter = (): Router => {
  const router = express.Router();

  router.get('/', asyncHandler(listAdmins));
  router.post('/', validate({ body: createAdminBodySchema }), asyncHandler(createAdmin));
  router.delete('/:id', validate({ params: adminIdParamsSchema }), asyncHandler(deleteAdmin));
  router.patch(
    '/:id/deactivate',
    validate({ params: adminIdParamsSchema }),
    asyncHandler(deactivateAdmin)
  );
  router.patch(
    '/:id/reactivate',
    validate({ params: adminIdParamsSchema }),
    asyncHandler(reactivateAdmin)
  );
  router.patch(
    '/:id/role',
    validate({ params: adminIdParamsSchema, body: updateRoleBodySchema }),
    asyncHandler(updateAdminRole)
  );

  return router;
};
