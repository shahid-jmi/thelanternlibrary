import { z } from 'zod';
import { objectId } from '../../common/validation/objectId.js';
import { ITEM_TYPES } from '../../common/constants/catalog.js';
import { MANUAL_STOCK_REASONS } from './stockMovement.model.js';

export const inventoryItemParamsSchema = z.object({
  itemType: z.enum(ITEM_TYPES, { message: 'Item type must be "book" or "product"' }),
  id: objectId('Invalid item id'),
});

export const listInventoryQuerySchema = z.object({
  status: z
    .enum(['all', 'low', 'out', 'attention', 'untracked'], { message: 'Invalid stock filter' })
    .default('all'),
  itemType: z.enum(ITEM_TYPES, { message: 'Item type must be "book" or "product"' }).optional(),
  search: z.string().trim().min(1).max(100, 'search must be at most 100 characters').optional(),
});

const quantity = z.coerce
  .number({ message: 'Quantity must be a number' })
  .int('Quantity must be a whole number');

const note = z.string().trim().max(300, 'Note is too long').optional();

export const adjustStockBodySchema = z.discriminatedUnion(
  'mode',
  [
    z.object({
      mode: z.literal('add'),
      quantity: quantity.min(1, 'Quantity must be at least 1'),
      reason: z.enum(MANUAL_STOCK_REASONS, { message: 'Invalid reason' }).optional(),
      note,
    }),
    z.object({
      mode: z.literal('remove'),
      quantity: quantity.min(1, 'Quantity must be at least 1'),
      reason: z.enum(MANUAL_STOCK_REASONS, { message: 'Invalid reason' }).optional(),
      note,
    }),
    z.object({
      mode: z.literal('set'),
      quantity: quantity.min(0, 'Stock cannot be negative'),
      reason: z.enum(MANUAL_STOCK_REASONS, { message: 'Invalid reason' }).optional(),
      note,
    }),
    z.object({ mode: z.literal('untrack'), note }),
  ],
  { message: 'mode must be one of add, remove, set, untrack' }
);

export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
export type AdjustStockInput = z.infer<typeof adjustStockBodySchema>;
