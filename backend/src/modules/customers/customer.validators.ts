import { z } from 'zod';
import { passwordSchema } from '../../common/validation/password.js';
import { objectId } from '../../common/validation/objectId.js';
import { INDIAN_STATES, PINCODE_PATTERN } from '../orders/order.constants.js';

const email = z
  .string({ message: 'A valid email is required' })
  .trim()
  .toLowerCase()
  .email('A valid email is required');

const name = z.string().trim().min(1, 'Name is required').max(120, 'Name is too long');
const phone = z.string().trim().max(30, 'Phone number is too long');

export const registerBodySchema = z.object({
  email,
  password: passwordSchema,
  name,
  phone: phone.optional().default(''),
});

export const loginBodySchema = z.object({
  email,
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

export const tokenBodySchema = z.object({
  token: z.string({ message: 'The link is invalid' }).min(1, 'The link is invalid'),
});

export const forgotPasswordBodySchema = z.object({ email });

export const resetPasswordBodySchema = z.object({
  token: z.string({ message: 'The link is invalid' }).min(1, 'The link is invalid'),
  newPassword: passwordSchema,
});

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export const updateProfileBodySchema = z.object({ name, phone });

export const addressBodySchema = z.object({
  label: z.string().trim().max(40, 'Label is too long').optional().default(''),
  name,
  phone: phone.min(1, 'Phone number is required'),
  altPhone: phone.optional().default(''),
  addressLine: z.string().trim().min(1, 'Address is required').max(500, 'Address is too long'),
  locality: z
    .string()
    .trim()
    .min(1, 'Locality / area is required')
    .max(120, 'Locality / area is too long'),
  city: z.string().trim().min(1, 'City is required').max(120, 'City is too long'),
  state: z.enum(INDIAN_STATES, { message: 'Select a valid state' }),
  pincode: z.string().trim().regex(PINCODE_PATTERN, 'Pincode must be a 6-digit number'),
  isDefault: z.boolean().optional().default(false),
});

export const addressIdParamsSchema = z.object({ addressId: objectId('Invalid address id') });
export const customerOrderParamsSchema = z.object({ id: objectId('Invalid order id') });

export const listCustomerOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const listAdminCustomersQuerySchema = z.object({
  search: z.string().trim().min(1).max(100, 'search must be at most 100 characters').optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const customerIdParamsSchema = z.object({ id: objectId('Invalid customer id') });

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
export type AddressInput = z.infer<typeof addressBodySchema>;
export type ListCustomerOrdersQuery = z.infer<typeof listCustomerOrdersQuerySchema>;
export type ListAdminCustomersQuery = z.infer<typeof listAdminCustomersQuerySchema>;
