import { z } from 'zod';
import { SHIPPING_CLASSES } from '../constants/catalog.js';

// Multipart form fields arrive as strings; an empty string means "clear this
// value" (null), and leaving the field out means "don't change it".
const nullableWholeNumber = (label: string) =>
  z
    .union([
      z.null(),
      z.literal(''),
      z.literal('null'),
      z.coerce.number({ message: `${label} must be a number` }),
    ])
    .transform((value) => (value === '' || value === 'null' || value === null ? null : value))
    .refine((value) => value === null || Number.isInteger(value), {
      message: `${label} must be a whole number`,
    })
    .refine((value) => value === null || value >= 0, { message: `${label} cannot be negative` });

// Shared by the book and product forms.
export const stockFormFields = {
  // Blank = don't track stock for this item.
  stock: nullableWholeNumber('Stock').optional(),
  // Blank = use the store-wide default.
  lowStockThreshold: nullableWholeNumber('Low-stock level').optional(),
  // Blank = default (books) or the category's class (products).
  shippingClass: z
    .union([z.null(), z.literal(''), z.enum(SHIPPING_CLASSES)], {
      message: 'Shipping class must be light, standard or heavy',
    })
    .transform((value) => (value ? value : null))
    .optional(),
};
