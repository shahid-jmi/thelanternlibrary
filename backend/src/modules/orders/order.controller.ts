import type { Request, Response } from 'express';
import { actorOf } from '../../common/utils/actor.js';
import * as orderService from './order.service.js';
import type {
  AddOrderNoteInput,
  CreateOrderInput,
  ListAdminOrdersQuery,
  QuoteOrderInput,
  ResolveAttentionInput,
  UpdateDeliveryChargeInput,
  UpdateOrderStatusInput,
  UpdatePaymentInput,
} from './order.validators.js';

const orderId = (req: Request): string => req.params.id as string;

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(
    req.body as CreateOrderInput,
    req.customer?.id ?? null
  );
  res.status(201).json(order);
};

export const quoteOrder = async (req: Request, res: Response): Promise<void> => {
  res.json(await orderService.quoteOrder(req.body as QuoteOrderInput));
};

export const listAdminOrders = async (req: Request, res: Response): Promise<void> => {
  const filters = req.query as unknown as ListAdminOrdersQuery;
  res.json(await orderService.listAdminOrders(filters));
};

export const getOrderViewCounts = async (req: Request, res: Response): Promise<void> => {
  res.json(await orderService.getOrderViewCounts());
};

export const getAdminOrder = async (req: Request, res: Response): Promise<void> => {
  res.json(await orderService.getAdminOrder(orderId(req)));
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  res.json(
    await orderService.updateOrderStatus(
      orderId(req),
      req.body as UpdateOrderStatusInput,
      actorOf(req)
    )
  );
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  res.json(
    await orderService.updatePayment(orderId(req), req.body as UpdatePaymentInput, actorOf(req))
  );
};

export const updateDeliveryCharge = async (req: Request, res: Response): Promise<void> => {
  const { deliveryCharge } = req.body as UpdateDeliveryChargeInput;
  res.json(await orderService.updateDeliveryCharge(orderId(req), deliveryCharge, actorOf(req)));
};

export const addInternalNote = async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body as AddOrderNoteInput;
  res.status(201).json(await orderService.addInternalNote(orderId(req), text, actorOf(req)));
};

export const resolveAttention = async (req: Request, res: Response): Promise<void> => {
  res.json(
    await orderService.resolveAttention(
      orderId(req),
      req.body as ResolveAttentionInput,
      actorOf(req)
    )
  );
};

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  const { order, pdf } = await orderService.getReceiptPdf(orderId(req));
  const filename = (order.receiptNumber ?? order.orderNumber).replace(/[^A-Za-z0-9-]/g, '-');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${filename}.pdf"`);
  res.send(pdf);
};
