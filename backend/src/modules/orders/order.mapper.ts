import type { Types } from 'mongoose';
import {
  DEFAULT_SHIPPING_CLASS,
  type ItemType,
  type ShippingClass,
} from '../../common/constants/catalog.js';
import type {
  DeliveryRegion,
  InternalNote,
  OrderChannel,
  OrderItem,
  OrderLean,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Shipment,
  StatusEvent,
} from './order.model.js';

export interface OrderItemDto {
  itemType: ItemType;
  itemId: Types.ObjectId;
  title: string;
  subtitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  coverImageUrl: string | null;
  shippingClass: ShippingClass;
  stockDeducted: boolean;
}

export interface AdminOrderDto {
  _id: Types.ObjectId;
  orderNumber: string;
  channel: OrderChannel;
  items: OrderItemDto[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryRegion: DeliveryRegion;
  deliveryEstimate: string;
  customerId: Types.ObjectId | null;
  customerName: string;
  customerPhone: string;
  customerAltPhone: string | null;
  customerEmail: string | null;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note: string | null;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paidAt: Date | null;
  stockPending: boolean;
  shipment: Shipment;
  internalNotes: InternalNote[];
  needsAttention: boolean;
  attentionReason: string | null;
  receiptNumber: string | null;
  receiptGeneratedAt: Date | null;
  isLegacy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// What the customer sees right after placing an order (and what the
// WhatsApp message is built from). Admin-only details are left out.
export interface PublicOrderDto {
  _id: Types.ObjectId;
  orderNumber: string;
  items: Array<
    Pick<OrderItemDto, 'itemType' | 'title' | 'subtitle' | 'unitPrice' | 'quantity' | 'lineTotal'>
  >;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryEstimate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

// Fields single-book orders had before the multi-item rework. The migration
// script converts them, but reading them here too means the admin panel
// keeps working if the new code is deployed before the migration runs.
interface LegacyOrderFields {
  book?: Types.ObjectId | { _id: Types.ObjectId } | null;
  bookTitle?: string;
  bookAuthor?: string;
  price?: number;
  invoiceNumber?: string | null;
  invoiceGeneratedAt?: Date | null;
}

type StoredOrder = OrderLean & LegacyOrderFields;

const LEGACY_STATUS: Record<string, { status: OrderStatus; paymentStatus: PaymentStatus }> = {
  pending: { status: 'placed', paymentStatus: 'unpaid' },
  paid: { status: 'delivered', paymentStatus: 'paid' },
  cancelled: { status: 'cancelled', paymentStatus: 'unpaid' },
};

const EMPTY_SHIPMENT: Shipment = {
  courier: null,
  trackingNumber: null,
  trackingUrl: null,
  shippedAt: null,
  deliveredAt: null,
};

export const normalizeOrder = (raw: StoredOrder): OrderLean => {
  if (Array.isArray(raw.items) && raw.items.length > 0) return raw;

  // An unmigrated single-book order.
  const legacyStatus = LEGACY_STATUS[raw.status as string] ?? LEGACY_STATUS.pending!;
  const price = raw.price ?? 0;
  const bookId =
    raw.book && '_id' in raw.book ? raw.book._id : ((raw.book as Types.ObjectId | null) ?? raw._id);
  const item: OrderItem = {
    itemType: 'book',
    item: bookId,
    title: raw.bookTitle ?? 'Unknown book',
    subtitle: raw.bookAuthor ?? '',
    unitPrice: price,
    quantity: 1,
    lineTotal: price,
    coverImageUrl: null,
    shippingClass: DEFAULT_SHIPPING_CLASS,
    stockDeducted: false,
  };
  const deliveryCharge = raw.deliveryCharge ?? 0;

  return {
    ...raw,
    orderNumber: raw.orderNumber ?? `LEGACY-${raw._id.toString().slice(-6).toUpperCase()}`,
    channel: 'whatsapp',
    items: [item],
    subtotal: price,
    deliveryCharge,
    total: price + deliveryCharge,
    status: legacyStatus.status,
    paymentStatus: legacyStatus.paymentStatus,
    statusHistory: raw.statusHistory ?? [],
    shipment: raw.shipment ?? EMPTY_SHIPMENT,
    internalNotes: raw.internalNotes ?? [],
    receipt: raw.invoiceNumber
      ? {
          number: raw.invoiceNumber,
          generatedAt: raw.invoiceGeneratedAt ?? raw.updatedAt,
          store: {
            name: 'The Lantern Library',
            address: 'Srinagar, Kashmir',
            phone: '',
            email: null,
          },
        }
      : null,
    isLegacy: true,
  };
};

const toItemDto = (item: OrderItem): OrderItemDto => ({
  itemType: item.itemType,
  itemId: item.item,
  title: item.title,
  subtitle: item.subtitle ?? '',
  unitPrice: item.unitPrice,
  quantity: item.quantity,
  lineTotal: item.lineTotal,
  coverImageUrl: item.coverImageUrl ?? null,
  shippingClass: item.shippingClass ?? DEFAULT_SHIPPING_CLASS,
  stockDeducted: item.stockDeducted ?? false,
});

export const toAdminOrderDto = (stored: StoredOrder): AdminOrderDto => {
  const order = normalizeOrder(stored);
  const items = order.items.map(toItemDto);
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    channel: order.channel ?? 'whatsapp',
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge ?? 0,
    total: order.total,
    deliveryRegion: order.deliveryRegion ?? 'domestic',
    deliveryEstimate: order.deliveryEstimate ?? '',
    customerId: order.customer ?? null,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAltPhone: order.customerAltPhone ?? null,
    customerEmail: order.customerEmail ?? null,
    addressLine: order.addressLine,
    locality: order.locality,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    note: order.note ?? null,
    status: order.status,
    statusHistory: order.statusHistory ?? [],
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod ?? null,
    paidAt: order.paidAt ?? null,
    stockPending: order.stockPending ?? false,
    shipment: order.shipment ?? EMPTY_SHIPMENT,
    internalNotes: order.internalNotes ?? [],
    needsAttention: order.needsAttention ?? false,
    attentionReason: order.attentionReason ?? null,
    receiptNumber: order.receipt?.number ?? null,
    receiptGeneratedAt: order.receipt?.generatedAt ?? null,
    isLegacy: order.isLegacy ?? false,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const toPublicOrderDto = (stored: StoredOrder): PublicOrderDto => {
  const order = normalizeOrder(stored);
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      itemType: item.itemType,
      title: item.title,
      subtitle: item.subtitle ?? '',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge ?? 0,
    total: order.total,
    deliveryEstimate: order.deliveryEstimate ?? '',
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  };
};

// What a signed-in customer sees about their own order: no internal notes,
// no admin emails, no stock bookkeeping.
export interface CustomerOrderDto {
  _id: Types.ObjectId;
  orderNumber: string;
  items: Array<
    Pick<
      OrderItemDto,
      | 'itemType'
      | 'itemId'
      | 'title'
      | 'subtitle'
      | 'unitPrice'
      | 'quantity'
      | 'lineTotal'
      | 'coverImageUrl'
    >
  >;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryEstimate: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  status: OrderStatus;
  timeline: Array<{ status: OrderStatus; at: Date }>;
  paymentStatus: PaymentStatus;
  shipment: Pick<
    Shipment,
    'courier' | 'trackingNumber' | 'trackingUrl' | 'shippedAt' | 'deliveredAt'
  >;
  receiptAvailable: boolean;
  createdAt: Date;
}

export const toCustomerOrderDto = (stored: StoredOrder): CustomerOrderDto => {
  const order = normalizeOrder(stored);
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      itemType: item.itemType,
      itemId: item.item,
      title: item.title,
      subtitle: item.subtitle ?? '',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      coverImageUrl: item.coverImageUrl ?? null,
    })),
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge ?? 0,
    total: order.total,
    deliveryEstimate: order.deliveryEstimate ?? '',
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    addressLine: order.addressLine,
    locality: order.locality,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    status: order.status,
    timeline: (order.statusHistory ?? []).map((entry) => ({ status: entry.status, at: entry.at })),
    paymentStatus: order.paymentStatus,
    shipment: order.shipment ?? EMPTY_SHIPMENT,
    receiptAvailable: order.paymentStatus !== 'unpaid',
    createdAt: order.createdAt,
  };
};
