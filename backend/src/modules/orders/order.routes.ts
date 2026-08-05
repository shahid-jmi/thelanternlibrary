import express, { type Router } from 'express';
import asyncHandler from '../../common/utils/asyncHandler.js';
import validate from '../../common/middleware/validate.js';
import {
  createOrderBodySchema,
  listAdminOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderStatusBodySchema,
} from './order.validators.js';
import {
  createOrder,
  getInvoice,
  listAdminOrders,
  updateOrderStatus,
} from './order.controller.js';

export const createPublicOrderRouter = (): Router => {
  const router = express.Router();
  router.post('/', validate({ body: createOrderBodySchema }), asyncHandler(createOrder));
  return router;
};

export const createAdminOrderRouter = (): Router => {
  const router = express.Router();
  router.get('/', validate({ query: listAdminOrdersQuerySchema }), asyncHandler(listAdminOrders));
  router.patch(
    '/:id/status',
    validate({ params: orderIdParamsSchema, body: updateOrderStatusBodySchema }),
    asyncHandler(updateOrderStatus)
  );
  router.get('/:id/invoice', validate({ params: orderIdParamsSchema }), asyncHandler(getInvoice));
  return router;
};
