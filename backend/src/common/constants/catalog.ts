// Something a customer can put in a cart. Books and products live in separate
// collections, so every cart line, order line, and stock movement records
// which kind of item it points at alongside its id.
export const ITEM_TYPES = ['book', 'product'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

// Rough parcel size, used instead of exact weights to price delivery. Books
// default to "standard"; products inherit their category's class unless the
// product overrides it.
export const SHIPPING_CLASSES = ['light', 'standard', 'heavy'] as const;
export type ShippingClass = (typeof SHIPPING_CLASSES)[number];
export const DEFAULT_SHIPPING_CLASS: ShippingClass = 'standard';

// What the storefront shows. "untracked" means the shop hasn't counted this
// item yet (stock is null) — it stays orderable with no quantity limit.
export const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'untracked'] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];
