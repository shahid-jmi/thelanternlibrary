import type { FilterQuery, SortOrder, UpdateQuery } from 'mongoose';
import Order, { type OrderAttrs, type OrderLean } from './order.model.js';
import type { OrderView } from './order.validators.js';

export type CreateOrderPayload = Omit<
  OrderAttrs,
  | 'status'
  | 'statusHistory'
  | 'paymentStatus'
  | 'paymentMethod'
  | 'paidAt'
  | 'stockPending'
  | 'shipment'
  | 'internalNotes'
  | 'needsAttention'
  | 'attentionReason'
  | 'receipt'
  | 'isLegacy'
>;

export interface AdminOrderListFilters {
  view: OrderView;
  search?: string;
  sort: 'newest' | 'oldest';
  page: number;
  pageSize: number;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Old single-book orders store their status as pending/paid/cancelled; the
// view filters match those too until the migration has run.
export const viewQuery = (view: OrderView): FilterQuery<OrderAttrs> => {
  switch (view) {
    case 'to_ship':
      return { status: { $in: ['placed', 'packed', 'pending'] } };
    case 'shipped':
      return { status: 'shipped' };
    case 'delivered':
      return { status: { $in: ['delivered', 'paid'] } };
    case 'returned':
      return { status: 'returned' };
    case 'cancelled':
      return { status: 'cancelled' };
    case 'attention':
      return { needsAttention: true };
    case 'unpaid':
      return {
        paymentStatus: { $in: ['unpaid', null] },
        status: { $in: ['placed', 'packed', 'pending'] },
      };
    default:
      return {};
  }
};

export const createOrder = async (payload: CreateOrderPayload): Promise<OrderLean> => {
  const created = await Order.create({
    ...payload,
    status: 'placed',
    statusHistory: [{ status: 'placed', at: new Date(), byEmail: null, note: null }],
  });
  return created.toObject() as unknown as OrderLean;
};

export const findById = async (id: string): Promise<OrderLean | null> =>
  Order.findById(id).lean<OrderLean>().exec();

export const findAdminOrders = async (
  filters: AdminOrderListFilters
): Promise<{ orders: OrderLean[]; total: number }> => {
  const query: FilterQuery<OrderAttrs> = viewQuery(filters.view);

  if (filters.search) {
    const pattern = { $regex: escapeRegex(filters.search), $options: 'i' };
    query.$or = [
      { orderNumber: pattern },
      { customerName: pattern },
      { customerPhone: pattern },
      { 'items.title': pattern },
      // Unmigrated single-book orders.
      { bookTitle: pattern },
    ] as FilterQuery<OrderAttrs>[];
  }

  const sort: Record<string, SortOrder> = { createdAt: filters.sort === 'oldest' ? 1 : -1 };
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip((filters.page - 1) * filters.pageSize)
      .limit(filters.pageSize)
      .lean<OrderLean[]>()
      .exec(),
    Order.countDocuments(query).exec(),
  ]);
  return { orders, total };
};

export const countByView = async (view: OrderView): Promise<number> =>
  Order.countDocuments(viewQuery(view)).exec();

// Applies an update only if the order still matches `guard` — e.g. still
// unpaid — so two admins acting at once can't both apply the same change.
export const updateIf = async (
  id: string,
  guard: FilterQuery<OrderAttrs>,
  update: UpdateQuery<OrderAttrs>
): Promise<OrderLean | null> =>
  Order.findOneAndUpdate({ _id: id, ...guard }, update, { new: true, runValidators: true })
    .lean<OrderLean>()
    .exec();

export const updateById = async (
  id: string,
  update: UpdateQuery<OrderAttrs>
): Promise<OrderLean | null> => updateIf(id, {}, update);

export const sumPaidTotals = async (since: Date): Promise<number> => {
  const [result] = await Order.aggregate<{ total: number }>([
    { $match: { paymentStatus: 'paid', paidAt: { $gte: since } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]).exec();
  return result?.total ?? 0;
};

export const countCreatedSince = async (since: Date): Promise<number> =>
  Order.countDocuments({ createdAt: { $gte: since } }).exec();
