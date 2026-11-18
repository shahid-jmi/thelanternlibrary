import mongoose, { Schema, type Types } from 'mongoose';
import {
  ITEM_TYPES,
  SHIPPING_CLASSES,
  type ItemType,
  type ShippingClass,
} from '../../common/constants/catalog.js';
import type { StoreDetails } from '../settings/settings.model.js';
import { INDIAN_STATES } from './order.constants.js';

// Delivery progress. Payment is tracked separately (paymentStatus), so a
// placed order can be unpaid (waiting on WhatsApp) or paid.
export const ORDER_STATUSES = [
  'placed',
  'packed',
  'shipped',
  'delivered',
  // Parcel came back (wrong address, refused, not collected). Can be
  // re-shipped or cancelled from here.
  'returned',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// How a manually recorded payment was made. Online payments will add their
// own method later.
export const PAYMENT_METHODS = ['upi', 'bank_transfer', 'cash', 'card', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Where the order came from. "whatsapp" = placed on the site, completed over
// WhatsApp. Online checkout will add another channel later.
export const ORDER_CHANNELS = ['whatsapp'] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const DELIVERY_REGIONS = ['local', 'domestic'] as const;
export type DeliveryRegion = (typeof DELIVERY_REGIONS)[number];

// A snapshot of the item at order time, so history and receipts stay correct
// even if the book/product is later edited or deleted.
export interface OrderItem {
  itemType: ItemType;
  item: Types.ObjectId;
  title: string;
  subtitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  coverImageUrl: string | null;
  shippingClass: ShippingClass;
  // Whether this line's copies were taken out of stock (only tracked items
  // are), so a cancellation puts back exactly what was taken.
  stockDeducted: boolean;
}

export interface StatusEvent {
  status: OrderStatus;
  at: Date;
  byEmail: string | null;
  note: string | null;
}

export interface InternalNote {
  text: string;
  byEmail: string | null;
  at: Date;
}

export interface Shipment {
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface Receipt {
  number: string;
  generatedAt: Date;
  // Store details as they were when the receipt was issued.
  store: StoreDetails;
}

export interface OrderAttrs {
  orderNumber: string;
  channel: OrderChannel;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryRegion: DeliveryRegion;
  deliveryEstimate: string;
  // Set once customer accounts exist; guest orders stay null.
  customer: Types.ObjectId | null;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  customerEmail?: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paidAt: Date | null;
  // Payment was recorded but there wasn't enough stock to take for it; the
  // order sits in "needs attention" until an admin resolves it.
  stockPending: boolean;
  shipment: Shipment;
  internalNotes: InternalNote[];
  needsAttention: boolean;
  attentionReason: string | null;
  receipt: Receipt | null;
  // Orders placed before multi-item orders existed (migrated).
  isLegacy: boolean;
}

export interface OrderLean extends OrderAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    itemType: { type: String, enum: ITEM_TYPES, required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    coverImageUrl: { type: String, default: null },
    shippingClass: { type: String, enum: SHIPPING_CLASSES, required: true },
    stockDeducted: { type: Boolean, default: false },
  },
  { _id: false }
);

const statusEventSchema = new Schema<StatusEvent>(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, required: true },
    byEmail: { type: String, default: null },
    note: { type: String, default: null },
  },
  { _id: false }
);

const internalNoteSchema = new Schema<InternalNote>(
  {
    text: { type: String, required: true, trim: true },
    byEmail: { type: String, default: null },
    at: { type: Date, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderAttrs>(
  {
    orderNumber: { type: String, required: true, unique: true },
    channel: { type: String, enum: ORDER_CHANNELS, default: 'whatsapp' },
    items: {
      type: [orderItemSchema],
      validate: [(items: OrderItem[]) => items.length > 0, 'An order needs at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryRegion: { type: String, enum: DELIVERY_REGIONS, default: 'domestic' },
    deliveryEstimate: { type: String, default: '' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAltPhone: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    addressLine: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, enum: INDIAN_STATES, required: true },
    pincode: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed', required: true },
    statusHistory: { type: [statusEventSchema], default: [] },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid', required: true },
    paymentMethod: { type: String, enum: [...PAYMENT_METHODS, null], default: null },
    paidAt: { type: Date, default: null },
    stockPending: { type: Boolean, default: false },
    shipment: {
      courier: { type: String, trim: true, default: null },
      trackingNumber: { type: String, trim: true, default: null },
      trackingUrl: { type: String, trim: true, default: null },
      shippedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
    },
    internalNotes: { type: [internalNoteSchema], default: [] },
    needsAttention: { type: Boolean, default: false },
    attentionReason: { type: String, default: null },
    receipt: {
      type: new Schema<Receipt>(
        {
          number: { type: String, required: true },
          generatedAt: { type: Date, required: true },
          store: {
            name: { type: String, required: true },
            address: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: null },
          },
        },
        { _id: false }
      ),
      default: null,
    },
    isLegacy: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, paidAt: -1 });
orderSchema.index({ needsAttention: 1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'receipt.number': 1 }, { unique: true, sparse: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
