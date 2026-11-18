import type { StockStatus } from '../constants/catalog.js';

export interface StockFields {
  // null = stock isn't tracked for this item (unlimited, always orderable).
  stock?: number | null;
  // null = use the store-wide default threshold.
  lowStockThreshold?: number | null;
}

export interface StockInfo {
  status: StockStatus;
  // Only set when stock is low, so the storefront can say "Only 2 left"
  // without revealing exact counts for well-stocked items.
  remaining: number | null;
}

export const effectiveThreshold = (item: StockFields, defaultThreshold: number): number =>
  item.lowStockThreshold ?? defaultThreshold;

export const getStockInfo = (item: StockFields, defaultThreshold: number): StockInfo => {
  const stock = item.stock ?? null;

  if (stock === null) return { status: 'untracked', remaining: null };
  if (stock <= 0) return { status: 'out_of_stock', remaining: 0 };
  if (stock <= effectiveThreshold(item, defaultThreshold)) {
    return { status: 'low_stock', remaining: stock };
  }
  return { status: 'in_stock', remaining: null };
};
