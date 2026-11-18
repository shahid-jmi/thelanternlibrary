export const BOOK_GENRES = [
  'fiction',
  'non-fiction',
  'poetry',
  'religious',
  'children',
  'history',
  'science',
  'other',
] as const;

export const BOOK_LANGUAGES = ['english', 'urdu', 'persian', 'arabic', 'other'] as const;
export const TRANSLATION_LANGUAGES = ['en', 'ur'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookLanguage = (typeof BOOK_LANGUAGES)[number];
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

export interface CoverImage {
  url: string;
  key: string | null;
}

export interface PublicBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  coverImage: CoverImage;
  isAvailable: boolean;
  isFeatured: boolean;
  stockStatus: StockStatus;
  /** Copies left — only set when stock is low. */
  stockRemaining: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalizedText {
  en: string;
  ur?: string;
}

export interface AdminBook extends Omit<PublicBook, 'title' | 'description'> {
  title: LocalizedText;
  description: LocalizedText;
  stock: number | null;
  lowStockThreshold: number | null;
  shippingClass: ShippingClass | null;
}

export interface BookPayload {
  title: LocalizedText;
  description: LocalizedText;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  isAvailable: boolean;
  isFeatured: boolean;
  stock: number | null;
  lowStockThreshold: number | null;
  shippingClass: ShippingClass | null;
}

export interface BookFilters {
  lang?: string;
  search?: string;
  genre?: string;
  language?: string;
  available?: string;
  featured?: string;
}

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImage: CoverImage;
}

export interface AdminCategory {
  _id: string;
  name: LocalizedText;
  slug: string;
  tagline: LocalizedText | null;
  description: LocalizedText | null;
  coverImage: CoverImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: LocalizedText;
  slug: string;
  tagline?: LocalizedText;
  description?: LocalizedText;
  isActive: boolean;
}

export interface PublicProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  coverImage: CoverImage;
  isAvailable: boolean;
  isFeatured: boolean;
  stockStatus: StockStatus;
  /** Copies left — only set when stock is low. */
  stockRemaining: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct extends Omit<PublicProduct, 'name' | 'description' | 'category'> {
  name: LocalizedText;
  description: LocalizedText;
  category: {
    _id: string;
    name: LocalizedText;
    slug: string;
    isActive: boolean;
  };
  stock: number | null;
  lowStockThreshold: number | null;
  shippingClass: ShippingClass | null;
}

export interface ProductPayload {
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  stock: number | null;
  lowStockThreshold: number | null;
  shippingClass: ShippingClass | null;
}

export interface ProductFilters {
  lang?: string;
  category?: string;
  available?: string;
  featured?: string;
  search?: string;
}

export const ITEM_TYPES = ['book', 'product'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const SHIPPING_CLASSES = ['light', 'standard', 'heavy'] as const;
export type ShippingClass = (typeof SHIPPING_CLASSES)[number];

// "untracked" = the shop isn't counting stock for this item; always orderable.
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'untracked';

export const ORDER_STATUSES = [
  'placed',
  'packed',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['upi', 'bank_transfer', 'cash', 'card', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_VIEWS = [
  'to_ship',
  'attention',
  'unpaid',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
  'all',
] as const;
export type OrderView = (typeof ORDER_VIEWS)[number];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export interface OrderLineInput {
  itemType: ItemType;
  itemId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderLineInput[];
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  customerEmail?: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
}

export interface OrderItem {
  itemType: ItemType;
  itemId: string;
  title: string;
  subtitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  coverImageUrl: string | null;
  shippingClass: ShippingClass;
  stockDeducted: boolean;
}

export interface PublicOrder {
  _id: string;
  orderNumber: string;
  items: Array<
    Pick<OrderItem, 'itemType' | 'title' | 'subtitle' | 'unitPrice' | 'quantity' | 'lineTotal'>
  >;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryEstimate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  byEmail: string | null;
  note: string | null;
}

export interface InternalNote {
  text: string;
  byEmail: string | null;
  at: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  channel: 'whatsapp';
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryRegion: 'local' | 'domestic';
  deliveryEstimate: string;
  customerId: string | null;
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
  paidAt: string | null;
  stockPending: boolean;
  shipment: {
    courier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  };
  internalNotes: InternalNote[];
  needsAttention: boolean;
  attentionReason: string | null;
  receiptNumber: string | null;
  receiptGeneratedAt: string | null;
  isLegacy: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderPage {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderFilters {
  view?: OrderView;
  search?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  note?: string;
}

export interface PaymentUpdate {
  paymentStatus: PaymentStatus;
  method?: PaymentMethod;
  note?: string;
}

export interface AdminDashboard {
  orders: { toShip: number; needsAttention: number; unpaid: number; placedToday: number };
  revenue: { today: number; thisMonth: number };
  stock: { lowStock: number; outOfStock: number };
}

export const ADMIN_ROLES = ['admin', 'super_admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminAccount {
  _id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  role: AdminRole;
}

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface InstagramPost {
  id: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  imageUrl: string;
  permalink: string;
  likeCount: number | null;
  timestamp: string;
}

export interface InventoryItem {
  itemType: ItemType;
  _id: string;
  title: string;
  subtitle: string;
  price: number;
  coverImageUrl: string | null;
  isAvailable: boolean;
  stock: number | null;
  lowStockThreshold: number | null;
  effectiveLowStockThreshold: number;
  stockStatus: StockStatus;
}

export const INVENTORY_FILTERS = ['attention', 'low', 'out', 'untracked', 'all'] as const;
export type InventoryFilter = (typeof INVENTORY_FILTERS)[number];

export const MANUAL_STOCK_REASONS = ['restock', 'shop_sale', 'damaged', 'correction'] as const;
export type ManualStockReason = (typeof MANUAL_STOCK_REASONS)[number];

export type StockAdjustment =
  | { mode: 'add' | 'remove' | 'set'; quantity: number; reason?: ManualStockReason; note?: string }
  | { mode: 'untrack'; note?: string };

export type StockReason =
  | ManualStockReason
  | 'tracking_started'
  | 'tracking_stopped'
  | 'order_paid'
  | 'order_cancelled'
  | 'payment_reverted';

export interface StockMovement {
  _id: string;
  delta: number;
  stockAfter: number | null;
  reason: StockReason;
  note: string | null;
  orderId: string | null;
  orderNumber: string | null;
  byEmail: string | null;
  createdAt: string;
}

export interface OrderQuoteLine {
  itemType: ItemType;
  itemId: string;
  title: string;
  subtitle: string;
  coverImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  shippingClass: ShippingClass;
  available: number | null;
  problem: string | null;
}

export interface OrderQuote {
  lines: OrderQuoteLine[];
  subtotal: number;
  deliveryCharge: number | null;
  freeDelivery: boolean;
  deliveryRegion: 'local' | 'domestic' | null;
  deliveryEstimate: string | null;
  freeDeliveryRemaining: number | null;
  total: number | null;
  canOrder: boolean;
}

export interface PublicSettings {
  storeName: string;
  freeDeliveryThreshold: number | null;
  processingTime: string;
  localStates: string[];
  estimates: { local: string; domestic: string };
}
