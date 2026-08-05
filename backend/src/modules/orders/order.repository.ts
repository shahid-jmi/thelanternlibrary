import type { FilterQuery, SortOrder } from 'mongoose';
import Order, { type OrderAttrs, type OrderLean, type OrderStatus } from './order.model.js';

export interface CreateOrderPayload {
  book: string;
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
}

export interface AdminOrderListFilters {
  search?: string;
  status?: OrderStatus;
  sort?: 'newest' | 'oldest';
}

export const createOrder = async (payload: CreateOrderPayload): Promise<OrderLean> => {
  const created = await Order.create({ ...payload, status: 'pending' });
  const order = await findById(created._id.toString());
  if (!order) throw new Error('Failed to load created order');
  return order;
};

export const findById = async (id: string): Promise<OrderLean | null> =>
  Order.findById(id).populate('book').lean<OrderLean>().exec();

export const findAdminOrders = async (filters: AdminOrderListFilters): Promise<OrderLean[]> => {
  const query: FilterQuery<OrderAttrs> = {};
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { bookTitle: { $regex: filters.search, $options: 'i' } },
      { customerPhone: { $regex: filters.search, $options: 'i' } },
    ];
  }
  const sort: Record<string, SortOrder> = { createdAt: filters.sort === 'oldest' ? 1 : -1 };
  return Order.find(query).sort(sort).populate('book').lean<OrderLean[]>().exec();
};

export const updateStatusById = async (
  id: string,
  status: OrderStatus
): Promise<OrderLean | null> =>
  Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    .populate('book')
    .lean<OrderLean>()
    .exec();

export const setInvoiceNumberById = async (
  id: string,
  invoiceNumber: string
): Promise<OrderLean | null> =>
  Order.findByIdAndUpdate(
    id,
    { invoiceNumber, invoiceGeneratedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('book')
    .lean<OrderLean>()
    .exec();

export const countInvoicedOrders = async (): Promise<number> =>
  Order.countDocuments({ invoiceNumber: { $ne: null } }).exec();
