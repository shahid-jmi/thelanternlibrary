import type { Types } from 'mongoose';
import type { OrderLean, OrderStatus } from './order.model.js';

export interface AdminOrderBookDto {
  _id: Types.ObjectId;
  title: string;
  coverImage: { url: string; key: string | null };
}

export interface AdminOrderDto {
  _id: Types.ObjectId;
  book: AdminOrderBookDto | null;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  deliveryCharge: number;
  customerName: string;
  customerPhone: string;
  customerAltPhone: string | null;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note: string | null;
  status: OrderStatus;
  invoiceNumber: string | null;
  invoiceGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicOrderDto {
  _id: Types.ObjectId;
  status: OrderStatus;
  createdAt: Date;
}

export const toAdminOrderDto = (order: OrderLean): AdminOrderDto => ({
  _id: order._id,
  book: order.book
    ? { _id: order.book._id, title: order.book.title.en, coverImage: order.book.coverImage }
    : null,
  bookTitle: order.bookTitle,
  bookAuthor: order.bookAuthor,
  price: order.price,
  // Defensive default for orders paid before this field existed.
  deliveryCharge: order.deliveryCharge ?? 0,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerAltPhone: order.customerAltPhone ?? null,
  addressLine: order.addressLine,
  locality: order.locality,
  city: order.city,
  state: order.state,
  pincode: order.pincode,
  note: order.note ?? null,
  status: order.status,
  invoiceNumber: order.invoiceNumber,
  invoiceGeneratedAt: order.invoiceGeneratedAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const toPublicOrderDto = (order: OrderLean): PublicOrderDto => ({
  _id: order._id,
  status: order.status,
  createdAt: order.createdAt,
});
