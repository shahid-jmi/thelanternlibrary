import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { ITEM_TYPES } from '../../common/constants/catalog.js';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from './order.model.js';
import { INDIAN_STATES, PINCODE_PATTERN } from './order.constants.js';

export const MAX_ORDER_LINES = 20;
export const MAX_LINE_QUANTITY = 20;

export const orderIdParamsSchema = z.object({
  id: objectId('Invalid order id'),
});

const orderLineSchema = z.object({
  itemType: z.enum(ITEM_TYPES, { message: 'Item type must be "book" or "product"' }),
  itemId: objectId('Invalid item id'),
  quantity: z.coerce
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_LINE_QUANTITY, `You can order at most ${MAX_LINE_QUANTITY} of one item`),
});

const orderLinesSchema = z
  .array(orderLineSchema, { message: 'Add at least one item' })
  .min(1, 'Add at least one item')
  .max(MAX_ORDER_LINES, `An order can have at most ${MAX_ORDER_LINES} different items`);

// Before multi-item orders, the storefront sent a single `book` id. Accept
// that shape too, so an older frontend build keeps working during a deploy.
const withLegacyBook = (value: unknown): unknown => {
  if (value && typeof value === 'object' && !('items' in value) && 'book' in value) {
    const { book, ...rest } = value as Record<string, unknown>;
    return { ...rest, items: [{ itemType: 'book', itemId: book, quantity: 1 }] };
  }
  return value;
};

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .optional()
    .transform((value) => (value ? value : undefined));

export const createOrderBodySchema = z.preprocess(
  withLegacyBook,
  z.object({
    items: orderLinesSchema,
    customerName: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
    customerPhone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .max(30, 'Phone number is too long'),
    customerAltPhone: optionalText(30, 'Alternate phone number'),
    customerEmail: z
      .union([z.literal(''), z.string().trim().toLowerCase().email('Enter a valid email address')])
      .optional()
      .transform((value) => (value ? value : undefined)),
    addressLine: z.string().trim().min(1, 'Address is required').max(500, 'Address is too long'),
    locality: z
      .string()
      .trim()
      .min(1, 'Locality / area is required')
      .max(120, 'Locality / area is too long'),
    city: z.string().trim().min(1, 'City is required').max(120, 'City is too long'),
    state: z.enum(INDIAN_STATES, { message: 'Select a valid state' }),
    pincode: z.string().trim().regex(PINCODE_PATTERN, 'Pincode must be a 6-digit number'),
    note: optionalText(500, 'Note'),
  })
);

export const quoteOrderBodySchema = z.object({
  items: orderLinesSchema,
  // Without a state the quote has no delivery charge yet.
  state: z.enum(INDIAN_STATES, { message: 'Select a valid state' }).optional(),
});

export const ORDER_VIEWS = [
  'all',
  'to_ship',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
  'attention',
  'unpaid',
] as const;
export type OrderView = (typeof ORDER_VIEWS)[number];

export const listAdminOrdersQuerySchema = z.object({
  view: z.enum(ORDER_VIEWS, { message: 'Invalid order view' }).default('all'),
  search: z
    .string()
    .trim()
    .min(1, 'search must be between 1 and 100 characters')
    .max(100, 'search must be between 1 and 100 characters')
    .optional(),
  sort: z
    .enum(['newest', 'oldest'], { message: 'sort must be "newest" or "oldest"' })
    .default('newest'),
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, 'pageSize must be between 1 and 100')
    .max(100, 'pageSize must be between 1 and 100')
    .default(25),
});

const shortText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .optional()
    .transform((value) => (value ? value : null));

export const updateOrderStatusBodySchema = z
  .object({
    status: z.enum(ORDER_STATUSES, { message: 'Invalid order status' }),
    courier: shortText(80, 'Courier name'),
    trackingNumber: shortText(80, 'Tracking number'),
    trackingUrl: z
      .union([z.literal(''), z.string().trim().url('Tracking link must be a valid URL')])
      .optional()
      .transform((value) => (value ? value : null)),
    note: shortText(300, 'Note'),
  })
  .refine((data) => data.status !== 'shipped' || Boolean(data.courier), {
    message: 'Courier name is required when marking an order shipped',
    path: ['courier'],
  });

export const updatePaymentBodySchema = z
  .object({
    paymentStatus: z.enum(PAYMENT_STATUSES, { message: 'Invalid payment status' }),
    method: z.enum(PAYMENT_METHODS, { message: 'Invalid payment method' }).optional(),
    note: shortText(300, 'Note'),
  })
  .refine((data) => data.paymentStatus !== 'paid' || data.method !== undefined, {
    message: 'Payment method is required when marking an order paid',
    path: ['method'],
  });

export const updateDeliveryChargeBodySchema = z.object({
  deliveryCharge: z.coerce
    .number({ message: 'Delivery charge must be a number' })
    .int('Delivery charge must be a whole number of rupees')
    .min(0, 'Delivery charge must be a positive number'),
});

export const addOrderNoteBodySchema = z.object({
  text: z.string().trim().min(1, 'Note cannot be empty').max(1000, 'Note is too long'),
});

export const resolveAttentionBodySchema = z.object({
  // Clear the flag without taking stock (e.g. the copy was sourced outside
  // the tracked inventory).
  skipStock: z.boolean().optional().default(false),
  note: shortText(300, 'Note'),
});

export type CreateOrderInput = z.infer<typeof createOrderBodySchema>;
export type QuoteOrderInput = z.infer<typeof quoteOrderBodySchema>;
export type OrderLineInput = z.infer<typeof orderLineSchema>;
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusBodySchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentBodySchema>;
export type UpdateDeliveryChargeInput = z.infer<typeof updateDeliveryChargeBodySchema>;
export type AddOrderNoteInput = z.infer<typeof addOrderNoteBodySchema>;
export type ResolveAttentionInput = z.infer<typeof resolveAttentionBodySchema>;
