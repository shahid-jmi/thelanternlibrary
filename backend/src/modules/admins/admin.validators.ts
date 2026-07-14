import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { ADMIN_ROLES } from './admin.constants.js';

export const adminIdParamsSchema = z.object({
  id: objectId('Invalid admin id'),
});

export const createAdminBodySchema = z.object({
  email: z
    .string({ message: 'A valid email is required' })
    .trim()
    .email('A valid email is required'),
  password: z
    .string({ message: 'Password must be at least 8 characters' })
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(ADMIN_ROLES, { message: 'Role must be either "admin" or "super_admin"' }),
});

export const updateRoleBodySchema = z.object({
  role: z.enum(ADMIN_ROLES, { message: 'Role must be either "admin" or "super_admin"' }),
});

export type CreateAdminInput = z.infer<typeof createAdminBodySchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleBodySchema>;
