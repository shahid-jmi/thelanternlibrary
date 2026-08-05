import mongoose, { Schema, type Types } from 'mongoose';
import type { BookLean } from '../books/book.model.js';
import { INDIAN_STATES } from './order.constants.js';

export const ORDER_STATUSES = ['pending', 'paid', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderAttrs {
  book: Types.ObjectId;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
  status: OrderStatus;
  invoiceNumber: string | null;
  invoiceGeneratedAt: Date | null;
}

// Repository reads always populate `book`, but the referenced book may since
// have been deleted — callers must handle `book: null`. The order also keeps
// its own snapshot of the title/author/price at order time so history and
// invoices stay accurate even if the book is edited or removed later.
export interface OrderLean extends Omit<OrderAttrs, 'book'> {
  _id: Types.ObjectId;
  book: BookLean | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderAttrs>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true, trim: true },
    bookAuthor: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAltPhone: { type: String, trim: true },
    addressLine: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, enum: INDIAN_STATES, required: true },
    pincode: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', required: true },
    invoiceNumber: { type: String, default: null },
    invoiceGeneratedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ bookTitle: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
