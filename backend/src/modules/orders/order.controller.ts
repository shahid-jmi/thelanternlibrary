import type { Request, Response } from 'express';
import * as orderService from './order.service.js';
import type {
  CreateOrderInput,
  ListAdminOrdersQuery,
  UpdateOrderStatusInput,
} from './order.validators.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(req.body as CreateOrderInput);
  res.status(201).json(order);
};

export const listAdminOrders = async (req: Request, res: Response): Promise<void> => {
  const filters = req.query as unknown as ListAdminOrdersQuery;
  const orders = await orderService.listAdminOrders(filters);
  res.json(orders);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status, deliveryCharge } = req.body as UpdateOrderStatusInput;
  const order = await orderService.updateOrderStatus(req.params.id as string, status, deliveryCharge);
  res.json(order);
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  const { order, pdf } = await orderService.getInvoicePdf(req.params.id as string);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${order.invoiceNumber}.pdf"`);
  res.send(pdf);
};
