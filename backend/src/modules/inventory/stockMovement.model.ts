import mongoose, { Schema, type Types } from 'mongoose';
import { ITEM_TYPES, type ItemType } from '../../common/constants/catalog.js';

// Reasons an admin can pick when adjusting stock by hand.
export const MANUAL_STOCK_REASONS = ['restock', 'shop_sale', 'damaged', 'correction'] as const;
export type ManualStockReason = (typeof MANUAL_STOCK_REASONS)[number];

export const STOCK_REASONS = [
  ...MANUAL_STOCK_REASONS,
  // Stock tracking switched on/off for an item.
  'tracking_started',
  'tracking_stopped',
  // Automatic, from orders.
  'order_paid',
  'order_cancelled',
  'payment_reverted',
] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

export interface StockMovementAttrs {
  itemType: ItemType;
  item: Types.ObjectId;
  itemTitle: string;
  // Positive = added, negative = removed. 0 for tracking on/off entries.
  delta: number;
  // null = the item is no longer tracked after this movement.
  stockAfter: number | null;
  reason: StockReason;
  note: string | null;
  order: Types.ObjectId | null;
  orderNumber: string | null;
  // Who made the change. null for automatic movements without an admin.
  byAdmin: Types.ObjectId | null;
  byEmail: string | null;
}

export interface StockMovementLean extends StockMovementAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
}

const stockMovementSchema = new Schema<StockMovementAttrs>(
  {
    itemType: { type: String, enum: ITEM_TYPES, required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, required: true },
    delta: { type: Number, required: true },
    stockAfter: { type: Number, default: null },
    reason: { type: String, enum: STOCK_REASONS, required: true },
    note: { type: String, trim: true, default: null },
    order: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    orderNumber: { type: String, default: null },
    byAdmin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    byEmail: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

stockMovementSchema.index({ itemType: 1, item: 1, createdAt: -1 });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
