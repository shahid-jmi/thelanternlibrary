import express, { type Request, type Response, type Router } from 'express';
import type { Types } from 'mongoose';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import NotFoundError from '../../common/errors/NotFoundError.js';
import Order, { type OrderLean } from '../orders/order.model.js';
import { toAdminOrderDto, type AdminOrderDto } from '../orders/order.mapper.js';
import Customer, { type CustomerLean } from './customer.model.js';
import { toCustomerDto, type CustomerDto } from './customer.service.js';
import {
  customerIdParamsSchema,
  listAdminCustomersQuerySchema,
  type ListAdminCustomersQuery,
} from './customer.validators.js';

export interface AdminCustomerSummary extends CustomerDto {
  orderCount: number;
  // Sum of order totals with a recorded payment (refunds excluded).
  totalSpent: number;
  lastOrderAt: Date | null;
  lastLoginAt: Date | null;
}

interface OrderStats {
  _id: Types.ObjectId;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const statsFor = async (ids: Types.ObjectId[]): Promise<Map<string, OrderStats>> => {
  const stats = await Order.aggregate<OrderStats>([
    { $match: { customer: { $in: ids } } },
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
        },
        lastOrderAt: { $max: '$createdAt' },
      },
    },
  ]).exec();
  return new Map(stats.map((item) => [item._id.toString(), item]));
};

const toSummary = (customer: CustomerLean, stats?: OrderStats): AdminCustomerSummary => ({
  ...toCustomerDto(customer),
  orderCount: stats?.orderCount ?? 0,
  totalSpent: stats?.totalSpent ?? 0,
  lastOrderAt: stats?.lastOrderAt ?? null,
  lastLoginAt: customer.lastLoginAt ?? null,
});

const listCustomers = async (filters: ListAdminCustomersQuery) => {
  const query = filters.search
    ? {
        $or: ['email', 'name', 'phone'].map((field) => ({
          [field]: { $regex: escapeRegex(filters.search!), $options: 'i' },
        })),
      }
    : {};
  const [customers, total] = await Promise.all([
    Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * filters.pageSize)
      .limit(filters.pageSize)
      .lean<CustomerLean[]>()
      .exec(),
    Customer.countDocuments(query).exec(),
  ]);
  const stats = await statsFor(customers.map((customer) => customer._id));
  return {
    customers: customers.map((customer) => toSummary(customer, stats.get(customer._id.toString()))),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
};

const getCustomer = async (
  id: string
): Promise<AdminCustomerSummary & { orders: AdminOrderDto[] }> => {
  const customer = await Customer.findById(id).lean<CustomerLean>().exec();
  if (!customer) throw new NotFoundError('Customer not found');
  const [stats, orders] = await Promise.all([
    statsFor([customer._id]),
    Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean<OrderLean[]>()
      .exec(),
  ]);
  return {
    ...toSummary(customer, stats.get(customer._id.toString())),
    orders: orders.map(toAdminOrderDto),
  };
};

// Read-only: customers manage their own details; the shop just looks them up.
export const createAdminCustomerRouter = (): Router => {
  const router = express.Router();
  router.get(
    '/',
    validate({ query: listAdminCustomersQuerySchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await listCustomers(req.query as unknown as ListAdminCustomersQuery));
    })
  );
  router.get(
    '/:id',
    validate({ params: customerIdParamsSchema }),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await getCustomer(req.params.id as string));
    })
  );
  return router;
};
