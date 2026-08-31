import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { ORDER_STATUSES } from './order.model.js';
import { INDIAN_STATES, PINCODE_PATTERN } from './order.constants.js';

export const orderIdParamsSchema = z.object({
  id: objectId('Invalid order id'),
});

export const createOrderBodySchema = z.object({
  book: objectId('Invalid book id'),
  customerName: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  customerPhone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(30, 'Phone number is too long'),
  customerAltPhone: z.string().trim().max(30, 'Alternate phone number is too long').optional(),
  addressLine: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address is too long'),
  locality: z
    .string()
    .trim()
    .min(1, 'Locality / area is required')
    .max(120, 'Locality / area is too long'),
  city: z.string().trim().min(1, 'City is required').max(120, 'City is too long'),
  state: z.enum(INDIAN_STATES, { message: 'Select a valid state' }),
  pincode: z.string().trim().regex(PINCODE_PATTERN, 'Pincode must be a 6-digit number'),
  note: z.string().trim().max(500, 'Note is too long').optional(),
});

export const listAdminOrdersQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, 'search must be between 1 and 100 characters')
    .max(100, 'search must be between 1 and 100 characters')
    .optional(),
  status: z.enum(ORDER_STATUSES, { message: 'Invalid order status' }).optional(),
  sort: z.enum(['newest', 'oldest'], { message: 'sort must be "newest" or "oldest"' }).default('newest'),
});

export const updateOrderStatusBodySchema = z
  .object({
    status: z.enum(ORDER_STATUSES, { message: 'Invalid order status' }),
    // Delivery cost varies per order and is only known once the admin marks
    // it paid — required at that point so the invoice reflects it.
    deliveryCharge: z.coerce
      .number({ message: 'Delivery charge must be a number' })
      .min(0, 'Delivery charge must be a positive number')
      .int('Delivery charge must be a whole number of rupees')
      .optional(),
  })
  .refine((data) => data.status !== 'paid' || data.deliveryCharge !== undefined, {
    message: 'Delivery charge is required when marking an order as paid',
    path: ['deliveryCharge'],
  });

export type CreateOrderInput = z.infer<typeof createOrderBodySchema>;
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusBodySchema>;
