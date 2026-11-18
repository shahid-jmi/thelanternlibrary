import { Types, type UpdateQuery } from 'mongoose';
import NotFoundError from '../../common/errors/NotFoundError.js';
import ValidationError from '../../common/errors/ValidationError.js';
import ConflictError from '../../common/errors/ConflictError.js';
import type { ErrorDetail } from '../../common/errors/AppError.js';
import logger from '../../common/utils/logger.js';
import type { Actor } from '../../common/utils/actor.js';
import { nextSequence } from '../../common/models/counter.js';
import { financialYearLabel } from '../../common/utils/dates.js';
import type { ItemType, ShippingClass } from '../../common/constants/catalog.js';
import { itemKey, loadCatalogItems } from '../catalog/catalog.service.js';
import { getSettings } from '../settings/settings.service.js';
import * as inventoryService from '../inventory/inventory.service.js';
import { sendNewOrderAlert, sendOrderShippedEmail } from './order.emails.js';
import * as orderRepository from './order.repository.js';
import { calculateDelivery, type DeliveryRegionKey } from './delivery.js';
import {
  normalizeOrder,
  toAdminOrderDto,
  toCustomerOrderDto,
  type CustomerOrderDto,
  toPublicOrderDto,
  type AdminOrderDto,
  type PublicOrderDto,
} from './order.mapper.js';
import type { OrderAttrs, OrderItem, OrderLean, OrderStatus } from './order.model.js';
import type {
  CreateOrderInput,
  ListAdminOrdersQuery,
  OrderLineInput,
  OrderView,
  QuoteOrderInput,
  ResolveAttentionInput,
  UpdateOrderStatusInput,
  UpdatePaymentInput,
} from './order.validators.js';
import { ORDER_VIEWS } from './order.validators.js';
import { buildReceiptPdf } from './receipt.pdf.js';

// ── Pricing ─────────────────────────────────────────────────────────────────

export interface PricedLine {
  itemType: ItemType;
  itemId: string;
  title: string;
  subtitle: string;
  coverImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  shippingClass: ShippingClass;
  // What's left to order, or null when stock isn't tracked.
  available: number | null;
  // Why this line can't be ordered as-is, if it can't.
  problem: string | null;
}

export interface OrderQuote {
  lines: PricedLine[];
  subtotal: number;
  // null until a delivery state is known.
  deliveryCharge: number | null;
  freeDelivery: boolean;
  deliveryRegion: DeliveryRegionKey | null;
  deliveryEstimate: string | null;
  // Subtotal still needed to reach free delivery (null = no threshold, or reached).
  freeDeliveryRemaining: number | null;
  total: number | null;
  canOrder: boolean;
}

// The same item added twice becomes one line with the quantities summed.
const mergeLines = (lines: OrderLineInput[]): OrderLineInput[] => {
  const merged = new Map<string, OrderLineInput>();
  for (const line of lines) {
    const key = itemKey(line);
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, quantity: existing.quantity + line.quantity } : line);
  }
  return [...merged.values()];
};

// Prices every line from the database — prices sent by the browser are never
// trusted — and checks each item can still be ordered in that quantity.
const priceLines = async (input: OrderLineInput[]): Promise<PricedLine[]> => {
  const lines = mergeLines(input);
  const catalog = await loadCatalogItems(lines);

  return lines.map((line) => {
    const item = catalog.get(itemKey(line));

    if (!item || !item.isAvailable) {
      return {
        itemType: line.itemType,
        itemId: line.itemId,
        title: item?.title ?? 'Unavailable item',
        subtitle: item?.subtitle ?? '',
        coverImageUrl: item?.coverImageUrl ?? null,
        unitPrice: item?.price ?? 0,
        quantity: line.quantity,
        lineTotal: 0,
        shippingClass: item?.shippingClass ?? 'standard',
        available: 0,
        problem: 'This item is no longer available',
      };
    }

    let problem: string | null = null;
    if (item.stock !== null && item.stock <= 0) {
      problem = `${item.title} is out of stock`;
    } else if (item.stock !== null && line.quantity > item.stock) {
      problem = `Only ${item.stock} left of ${item.title}`;
    }

    return {
      itemType: line.itemType,
      itemId: line.itemId,
      title: item.title,
      subtitle: item.subtitle,
      coverImageUrl: item.coverImageUrl,
      unitPrice: item.price,
      quantity: line.quantity,
      lineTotal: item.price * line.quantity,
      shippingClass: item.shippingClass,
      available: item.stock,
      problem,
    };
  });
};

const buildQuote = async (items: OrderLineInput[], state?: string): Promise<OrderQuote> => {
  const [lines, settings] = await Promise.all([priceLines(items), getSettings()]);
  const orderable = lines.filter((line) => !line.problem);
  const subtotal = orderable.reduce((sum, line) => sum + line.lineTotal, 0);
  const threshold = settings.delivery.freeDeliveryThreshold;
  const freeDeliveryRemaining =
    threshold !== null && subtotal < threshold ? threshold - subtotal : null;

  const delivery = state ? calculateDelivery(orderable, subtotal, state, settings.delivery) : null;

  return {
    lines,
    subtotal,
    deliveryCharge: delivery?.charge ?? null,
    freeDelivery: delivery?.isFree ?? false,
    deliveryRegion: delivery?.region ?? null,
    deliveryEstimate: delivery?.estimate ?? null,
    freeDeliveryRemaining,
    total: delivery ? subtotal + delivery.charge : null,
    canOrder: lines.length > 0 && lines.every((line) => !line.problem),
  };
};

export const quoteOrder = async (input: QuoteOrderInput): Promise<OrderQuote> =>
  buildQuote(input.items, input.state);

// ── Placing an order ────────────────────────────────────────────────────────

const generateOrderNumber = async (): Promise<string> =>
  `LL-${1000 + (await nextSequence('order'))}`;

const generateReceiptNumber = async (): Promise<string> => {
  const year = financialYearLabel();
  const seq = await nextSequence(`receipt-${year}`);
  return `LL/${year}/${String(seq).padStart(4, '0')}`;
};

const notify = (task: Promise<void>, context: string): void => {
  task.catch((error: unknown) => logger.error({ err: error }, context));
};

export const createOrder = async (
  payload: CreateOrderInput,
  customerId: string | null = null
): Promise<PublicOrderDto> => {
  const quote = await buildQuote(payload.items, payload.state);

  const problems: ErrorDetail[] = quote.lines.flatMap((line, index) =>
    line.problem ? [{ path: `items.${index}`, msg: line.problem }] : []
  );
  if (problems.length > 0) {
    // Out-of-stock is a clash with current stock (409); a missing item is a
    // bad request (400).
    const outOfStock = quote.lines.some(
      (line) => line.problem && line.problem !== 'This item is no longer available'
    );
    if (outOfStock)
      throw new ConflictError('Some items are not available in that quantity', problems);
    throw new ValidationError('Validation failed', problems);
  }

  const items: OrderItem[] = quote.lines.map((line) => ({
    itemType: line.itemType,
    item: line.itemId as unknown as OrderItem['item'],
    title: line.title,
    subtitle: line.subtitle,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    lineTotal: line.lineTotal,
    coverImageUrl: line.coverImageUrl,
    shippingClass: line.shippingClass,
    stockDeducted: false,
  }));

  const order = await orderRepository.createOrder({
    orderNumber: await generateOrderNumber(),
    channel: 'whatsapp',
    items,
    subtotal: quote.subtotal,
    deliveryCharge: quote.deliveryCharge ?? 0,
    total: quote.total ?? quote.subtotal,
    deliveryRegion: quote.deliveryRegion ?? 'domestic',
    deliveryEstimate: quote.deliveryEstimate ?? '',
    customer: customerId ? new Types.ObjectId(customerId) : null,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerAltPhone: payload.customerAltPhone,
    customerEmail: payload.customerEmail,
    addressLine: payload.addressLine,
    locality: payload.locality,
    city: payload.city,
    state: payload.state,
    pincode: payload.pincode,
    note: payload.note,
  });

  const dto = toAdminOrderDto(order);
  notify(sendNewOrderAlert(dto), 'Failed to send new-order alert');

  return toPublicOrderDto(order);
};

// ── Admin: reading ──────────────────────────────────────────────────────────

export interface AdminOrderPage {
  orders: AdminOrderDto[];
  total: number;
  page: number;
  pageSize: number;
}

export const listAdminOrders = async (filters: ListAdminOrdersQuery): Promise<AdminOrderPage> => {
  const { orders, total } = await orderRepository.findAdminOrders(filters);
  return {
    orders: orders.map(toAdminOrderDto),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
};

export const getOrderViewCounts = async (): Promise<Record<OrderView, number>> => {
  const counts = await Promise.all(ORDER_VIEWS.map((view) => orderRepository.countByView(view)));
  return Object.fromEntries(ORDER_VIEWS.map((view, index) => [view, counts[index]])) as Record<
    OrderView,
    number
  >;
};

const loadOrder = async (id: string): Promise<OrderLean> => {
  const stored = await orderRepository.findById(id);
  if (!stored) throw new NotFoundError('Order not found');
  return normalizeOrder(stored);
};

export const getAdminOrder = async (id: string): Promise<AdminOrderDto> =>
  toAdminOrderDto(await loadOrder(id));

// ── Admin: status changes ───────────────────────────────────────────────────

// Which status each status may move to. Kept deliberately small: mistakes are
// fixed by moving forward (e.g. returned → shipped again), not by undoing.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['packed', 'shipped', 'cancelled'],
  packed: ['placed', 'shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  returned: ['shipped', 'cancelled'],
  cancelled: [],
};

const event = (status: OrderStatus, actor: Actor | null, note: string | null = null) => ({
  status,
  at: new Date(),
  byEmail: actor?.email ?? null,
  note,
});

const stockRef = (order: OrderLean) => ({ _id: order._id, orderNumber: order.orderNumber });

const stockLines = (order: OrderLean) =>
  order.items.map((item) => ({
    itemType: item.itemType,
    item: item.item,
    title: item.title,
    quantity: item.quantity,
    stockDeducted: item.stockDeducted,
  }));

const saved = (order: OrderLean | null): AdminOrderDto => {
  // The guarded update found nothing: someone else changed the order first.
  if (!order)
    throw new ConflictError('This order was just changed by someone else. Reload and try again.');
  return toAdminOrderDto(order);
};

export const updateOrderStatus = async (
  id: string,
  input: UpdateOrderStatusInput,
  actor: Actor
): Promise<AdminOrderDto> => {
  const order = await loadOrder(id);
  const next = input.status;

  if (order.status === next) return toAdminOrderDto(order);

  if (!ALLOWED_TRANSITIONS[order.status].includes(next)) {
    throw new ValidationError('Validation failed', [
      { path: 'status', msg: `An order that is ${order.status} cannot be marked ${next}` },
    ]);
  }

  if (next === 'shipped' && order.paymentStatus !== 'paid') {
    throw new ValidationError('Validation failed', [
      { path: 'status', msg: 'Record the payment before marking the order shipped' },
    ]);
  }

  const set: Record<string, unknown> = { status: next };
  const now = new Date();

  if (next === 'shipped') {
    set['shipment.courier'] = input.courier;
    set['shipment.trackingNumber'] = input.trackingNumber;
    set['shipment.trackingUrl'] = input.trackingUrl;
    set['shipment.shippedAt'] = now;
    set['shipment.deliveredAt'] = null;
  }
  if (next === 'delivered') set['shipment.deliveredAt'] = now;

  if (next === 'cancelled') {
    await inventoryService.restoreForOrder(
      stockRef(order),
      stockLines(order),
      'order_cancelled',
      actor
    );
    order.items.forEach((_, index) => {
      set[`items.${index}.stockDeducted`] = false;
    });
    set.stockPending = false;
    if (order.paymentStatus === 'paid') {
      set.needsAttention = true;
      set.attentionReason = 'Cancelled after payment — refund the customer, then mark it refunded';
    } else {
      set.needsAttention = false;
      set.attentionReason = null;
    }
  }

  const updated = await orderRepository.updateIf(
    id,
    { status: order.status },
    { $set: set, $push: { statusHistory: event(next, actor, input.note) } }
  );
  const dto = saved(updated);

  if (next === 'shipped' && dto.customerEmail) {
    notify(sendOrderShippedEmail(dto), 'Failed to send order-shipped email');
  }
  return dto;
};

// ── Admin: payment ──────────────────────────────────────────────────────────

const shortageReason = (shortages: inventoryService.StockShortage[]): string =>
  `Not enough stock: ${shortages
    .map((s) => `${s.title} (needed ${s.requested}, had ${s.available})`)
    .join(', ')}. Restock or source the copies, then resolve.`;

export const updatePayment = async (
  id: string,
  input: UpdatePaymentInput,
  actor: Actor
): Promise<AdminOrderDto> => {
  const order = await loadOrder(id);
  const next = input.paymentStatus;
  if (order.paymentStatus === next && next !== 'paid') return toAdminOrderDto(order);

  if (next === 'paid') {
    if (order.paymentStatus !== 'unpaid') {
      // Already paid: just correct the recorded method.
      if (order.paymentStatus === 'paid') {
        return saved(
          await orderRepository.updateIf(
            id,
            { paymentStatus: 'paid' },
            { $set: { paymentMethod: input.method } }
          )
        );
      }
      throw new ValidationError('Validation failed', [
        { path: 'paymentStatus', msg: 'A refunded order cannot be marked paid again' },
      ]);
    }
    if (order.status === 'cancelled') {
      throw new ValidationError('Validation failed', [
        { path: 'paymentStatus', msg: 'A cancelled order cannot be marked paid' },
      ]);
    }

    // Claim the payment first so two admins can't both record it (and take
    // stock twice).
    const claimed = await orderRepository.updateIf(
      id,
      { paymentStatus: 'unpaid' },
      {
        $set: { paymentStatus: 'paid', paymentMethod: input.method, paidAt: new Date() },
        $push: {
          internalNotes: {
            text: `Payment recorded (${input.method})${input.note ? `: ${input.note}` : ''}`,
            byEmail: actor.email,
            at: new Date(),
          },
        },
      }
    );
    if (!claimed) return saved(null);

    const result = await inventoryService.deductForOrder(stockRef(order), stockLines(order), actor);
    const set: Record<string, unknown> = {};
    if (result.ok) {
      result.deducted.forEach((deducted, index) => {
        set[`items.${index}.stockDeducted`] = deducted;
      });
    } else {
      set.stockPending = true;
      set.needsAttention = true;
      set.attentionReason = shortageReason(result.shortages);
    }
    return saved(
      Object.keys(set).length ? await orderRepository.updateById(id, { $set: set }) : claimed
    );
  }

  if (next === 'unpaid') {
    if (order.paymentStatus !== 'paid' || !['placed', 'packed'].includes(order.status)) {
      throw new ValidationError('Validation failed', [
        {
          path: 'paymentStatus',
          msg: 'Only a paid order that has not shipped can be marked unpaid',
        },
      ]);
    }
    const reverted = await orderRepository.updateIf(
      id,
      { paymentStatus: 'paid' },
      {
        $set: {
          paymentStatus: 'unpaid',
          paymentMethod: null,
          paidAt: null,
          stockPending: false,
          needsAttention: false,
          attentionReason: null,
          ...Object.fromEntries(
            order.items.map((_, index) => [`items.${index}.stockDeducted`, false])
          ),
        },
        $push: {
          internalNotes: {
            text: `Payment reverted to unpaid${input.note ? `: ${input.note}` : ''}`,
            byEmail: actor.email,
            at: new Date(),
          },
        },
      }
    );
    if (reverted) {
      await inventoryService.restoreForOrder(
        stockRef(order),
        stockLines(order),
        'payment_reverted',
        actor
      );
    }
    return saved(reverted);
  }

  // refunded
  if (order.paymentStatus !== 'paid' || !['cancelled', 'returned'].includes(order.status)) {
    throw new ValidationError('Validation failed', [
      {
        path: 'paymentStatus',
        msg: 'Only a paid order that was cancelled or returned can be marked refunded',
      },
    ]);
  }
  return saved(
    await orderRepository.updateIf(
      id,
      { paymentStatus: 'paid' },
      {
        $set: { paymentStatus: 'refunded', needsAttention: false, attentionReason: null },
        $push: {
          internalNotes: {
            text: `Marked refunded${input.note ? `: ${input.note}` : ''}`,
            byEmail: actor.email,
            at: new Date(),
          },
        },
      }
    )
  );
};

// ── Admin: other edits ──────────────────────────────────────────────────────

export const updateDeliveryCharge = async (
  id: string,
  deliveryCharge: number,
  actor: Actor
): Promise<AdminOrderDto> => {
  const order = await loadOrder(id);
  if (order.paymentStatus !== 'unpaid' || order.status === 'cancelled') {
    throw new ValidationError('Validation failed', [
      { path: 'deliveryCharge', msg: 'The delivery charge can only be changed before payment' },
    ]);
  }
  return saved(
    await orderRepository.updateIf(
      id,
      { paymentStatus: 'unpaid' },
      {
        $set: { deliveryCharge, total: order.subtotal + deliveryCharge },
        $push: {
          internalNotes: {
            text: `Delivery charge changed from Rs ${order.deliveryCharge} to Rs ${deliveryCharge}`,
            byEmail: actor.email,
            at: new Date(),
          },
        },
      }
    )
  );
};

export const addInternalNote = async (
  id: string,
  text: string,
  actor: Actor
): Promise<AdminOrderDto> => {
  await loadOrder(id);
  return saved(
    await orderRepository.updateById(id, {
      $push: { internalNotes: { text, byEmail: actor.email, at: new Date() } },
    })
  );
};

export const resolveAttention = async (
  id: string,
  input: ResolveAttentionInput,
  actor: Actor
): Promise<AdminOrderDto> => {
  const order = await loadOrder(id);
  if (!order.needsAttention) return toAdminOrderDto(order);

  const set: Record<string, unknown> = { needsAttention: false, attentionReason: null };

  if (order.stockPending && !input.skipStock) {
    const pending = order.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.stockDeducted);
    const result = await inventoryService.deductForOrder(
      stockRef(order),
      pending.map(({ item }) => ({
        itemType: item.itemType,
        item: item.item,
        title: item.title,
        quantity: item.quantity,
      })),
      actor
    );
    if (!result.ok) {
      throw new ConflictError(shortageReason(result.shortages));
    }
    result.deducted.forEach((deducted, position) => {
      set[`items.${pending[position]!.index}.stockDeducted`] = deducted;
    });
  }
  set.stockPending = false;

  const update: UpdateQuery<OrderAttrs> = {
    $set: set,
    $push: {
      internalNotes: {
        text: `Resolved: ${order.attentionReason ?? 'needs attention'}${
          input.skipStock && order.stockPending ? ' (stock not taken)' : ''
        }${input.note ? ` — ${input.note}` : ''}`,
        byEmail: actor.email,
        at: new Date(),
      },
    },
  };
  return saved(await orderRepository.updateIf(id, { needsAttention: true }, update));
};

// ── Receipts ────────────────────────────────────────────────────────────────

export const getReceiptPdf = async (id: string): Promise<{ order: AdminOrderDto; pdf: Buffer }> => {
  let order = await loadOrder(id);
  if (order.paymentStatus === 'unpaid') {
    throw new ValidationError('Validation failed', [
      {
        path: 'paymentStatus',
        msg: 'A receipt can only be generated once the payment is recorded',
      },
    ]);
  }

  if (!order.receipt) {
    const { store } = await getSettings();
    const issued = await orderRepository.updateIf(
      id,
      { receipt: null },
      {
        $set: {
          receipt: { number: await generateReceiptNumber(), generatedAt: new Date(), store },
        },
      }
    );
    // Someone else issued it a moment earlier — use theirs.
    order = normalizeOrder(issued ?? (await orderRepository.findById(id))!);
  }

  const dto = toAdminOrderDto(order);
  return { order: dto, pdf: await buildReceiptPdf(dto, order.receipt!.store) };
};

// ── Customer account ────────────────────────────────────────────────────────

export interface CustomerOrderPage {
  orders: CustomerOrderDto[];
  total: number;
  page: number;
  pageSize: number;
}

export const listCustomerOrders = async (
  customerId: string,
  page: number,
  pageSize: number
): Promise<CustomerOrderPage> => {
  const { orders, total } = await orderRepository.findCustomerOrders(customerId, page, pageSize);
  return { orders: orders.map(toCustomerOrderDto), total, page, pageSize };
};

// Another customer's order looks exactly like a missing one.
const loadCustomerOrder = async (customerId: string, id: string): Promise<OrderLean> => {
  const order = await loadOrder(id);
  if (!order.customer || order.customer.toString() !== customerId) {
    throw new NotFoundError('Order not found');
  }
  return order;
};

export const getCustomerOrder = async (customerId: string, id: string): Promise<CustomerOrderDto> =>
  toCustomerOrderDto(await loadCustomerOrder(customerId, id));

export const getCustomerReceiptPdf = async (
  customerId: string,
  id: string
): Promise<{ order: AdminOrderDto; pdf: Buffer }> => {
  await loadCustomerOrder(customerId, id);
  return getReceiptPdf(id);
};
