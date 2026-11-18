import express, { type Router } from 'express';
import rateLimit from 'express-rate-limit';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import env from '../../config/env.js';
import {
  addOrderNoteBodySchema,
  createOrderBodySchema,
  listAdminOrdersQuerySchema,
  orderIdParamsSchema,
  quoteOrderBodySchema,
  resolveAttentionBodySchema,
  updateDeliveryChargeBodySchema,
  updateOrderStatusBodySchema,
  updatePaymentBodySchema,
} from './order.validators.js';
import {
  addInternalNote,
  createOrder,
  getAdminOrder,
  getOrderViewCounts,
  getReceipt,
  listAdminOrders,
  quoteOrder,
  resolveAttention,
  updateDeliveryCharge,
  updateOrderStatus,
  updatePayment,
} from './order.controller.js';

// Enough for a real customer (a few retries, a second order), tight enough to
// stop a script flooding the orders list with fake orders.
const createOrderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: { message: 'Too many orders from this connection. Please try again later.' },
});

// The cart asks for a fresh quote whenever it changes.
const quoteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: { message: 'Too many requests. Please try again later.' },
});

export const createPublicOrderRouter = (): Router => {
  const router = express.Router();
  router.post(
    '/',
    createOrderRateLimiter,
    validate({ body: createOrderBodySchema }),
    asyncHandler(createOrder)
  );
  router.post(
    '/quote',
    quoteRateLimiter,
    validate({ body: quoteOrderBodySchema }),
    asyncHandler(quoteOrder)
  );
  return router;
};

export const createAdminOrderRouter = (): Router => {
  const router = express.Router();
  const byId = { params: orderIdParamsSchema };

  router.get('/', validate({ query: listAdminOrdersQuerySchema }), asyncHandler(listAdminOrders));
  router.get('/counts', asyncHandler(getOrderViewCounts));
  router.get('/:id', validate(byId), asyncHandler(getAdminOrder));
  router.patch(
    '/:id/status',
    validate({ ...byId, body: updateOrderStatusBodySchema }),
    asyncHandler(updateOrderStatus)
  );
  router.patch(
    '/:id/payment',
    validate({ ...byId, body: updatePaymentBodySchema }),
    asyncHandler(updatePayment)
  );
  router.patch(
    '/:id/delivery-charge',
    validate({ ...byId, body: updateDeliveryChargeBodySchema }),
    asyncHandler(updateDeliveryCharge)
  );
  router.post(
    '/:id/notes',
    validate({ ...byId, body: addOrderNoteBodySchema }),
    asyncHandler(addInternalNote)
  );
  router.post(
    '/:id/resolve',
    validate({ ...byId, body: resolveAttentionBodySchema }),
    asyncHandler(resolveAttention)
  );
  router.get('/:id/receipt', validate(byId), asyncHandler(getReceipt));
  return router;
};
