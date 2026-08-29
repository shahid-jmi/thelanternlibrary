import NotFoundError from '../../common/errors/NotFoundError.js';
import ValidationError from '../../common/errors/ValidationError.js';
import * as orderRepository from './order.repository.js';
import * as bookRepository from '../books/book.repository.js';
import {
  toAdminOrderDto,
  toPublicOrderDto,
  type AdminOrderDto,
  type PublicOrderDto,
} from './order.mapper.js';
import { buildInvoicePdf } from './invoice.pdf.js';
import type { OrderStatus } from './order.model.js';
import type { CreateOrderInput, ListAdminOrdersQuery } from './order.validators.js';

export const createOrder = async (payload: CreateOrderInput): Promise<PublicOrderDto> => {
  const book = await bookRepository.findById(payload.book);
  if (!book) {
    throw new ValidationError('Validation failed', [{ path: 'book', msg: 'Book does not exist' }]);
  }

  const order = await orderRepository.createOrder({
    book: payload.book,
    bookTitle: book.title.en,
    bookAuthor: book.author,
    price: book.price,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerAltPhone: payload.customerAltPhone,
    addressLine: payload.addressLine,
    locality: payload.locality,
    city: payload.city,
    state: payload.state,
    pincode: payload.pincode,
    note: payload.note,
  });

  return toPublicOrderDto(order);
};

export const listAdminOrders = async (filters: ListAdminOrdersQuery): Promise<AdminOrderDto[]> => {
  const orders = await orderRepository.findAdminOrders(filters);
  return orders.map(toAdminOrderDto);
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  deliveryCharge?: number
): Promise<AdminOrderDto> => {
  const order = await orderRepository.updateStatusById(id, status, deliveryCharge);
  if (!order) throw new NotFoundError('Order not found');
  return toAdminOrderDto(order);
};

const generateInvoiceNumber = async (): Promise<string> => {
  const count = await orderRepository.countInvoicedOrders();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const getInvoicePdf = async (id: string): Promise<{ order: AdminOrderDto; pdf: Buffer }> => {
  let order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError('Order not found');
  if (order.status !== 'paid') {
    throw new ValidationError('Validation failed', [
      { path: 'status', msg: 'Invoice can only be generated once the order is marked paid' },
    ]);
  }

  if (!order.invoiceNumber) {
    const invoiceNumber = await generateInvoiceNumber();
    order = await orderRepository.setInvoiceNumberById(id, invoiceNumber);
    if (!order) throw new NotFoundError('Order not found');
  }

  const orderDto = toAdminOrderDto(order);
  const pdf = await buildInvoicePdf(orderDto);
  return { order: orderDto, pdf };
};
