import { Types } from 'mongoose';
import NotFoundError from '../../common/errors/NotFoundError.js';
import ConflictError from '../../common/errors/ConflictError.js';
import type { ItemType, StockStatus } from '../../common/constants/catalog.js';
import { getStockInfo, type StockInfo } from '../../common/utils/stock.js';
import {
  loadAllCatalogItems,
  loadCatalogItem,
  stockModelFor,
  type CatalogItem,
  type ItemRef,
} from '../catalog/catalog.service.js';
import { getDefaultLowStockThreshold } from '../settings/settings.service.js';
import StockMovement, {
  type ManualStockReason,
  type StockMovementLean,
  type StockReason,
} from './stockMovement.model.js';
import type { AdjustStockInput, ListInventoryQuery } from './inventory.validators.js';
import type { Actor } from '../../common/utils/actor.js';

export interface InventoryItemDto {
  itemType: ItemType;
  _id: Types.ObjectId;
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

export interface StockMovementDto {
  _id: Types.ObjectId;
  delta: number;
  stockAfter: number | null;
  reason: StockReason;
  note: string | null;
  orderId: Types.ObjectId | null;
  orderNumber: string | null;
  byEmail: string | null;
  createdAt: Date;
}

const toInventoryItemDto = (item: CatalogItem, defaultThreshold: number): InventoryItemDto => ({
  itemType: item.itemType,
  _id: item._id,
  title: item.title,
  subtitle: item.subtitle,
  price: item.price,
  coverImageUrl: item.coverImageUrl,
  isAvailable: item.isAvailable,
  stock: item.stock,
  lowStockThreshold: item.lowStockThreshold,
  effectiveLowStockThreshold: item.lowStockThreshold ?? defaultThreshold,
  stockStatus: getStockInfo(item, defaultThreshold).status,
});

const toMovementDto = (movement: StockMovementLean): StockMovementDto => ({
  _id: movement._id,
  delta: movement.delta,
  stockAfter: movement.stockAfter,
  reason: movement.reason,
  note: movement.note,
  orderId: movement.order,
  orderNumber: movement.orderNumber,
  byEmail: movement.byEmail,
  createdAt: movement.createdAt,
});

interface MovementInput {
  item: Pick<CatalogItem, 'itemType' | '_id' | 'title'>;
  delta: number;
  stockAfter: number | null;
  reason: StockReason;
  note?: string | null;
  order?: { _id: Types.ObjectId; orderNumber: string } | null;
  actor?: Actor | null;
}

const recordMovement = async (input: MovementInput): Promise<void> => {
  await StockMovement.create({
    itemType: input.item.itemType,
    item: input.item._id,
    itemTitle: input.item.title,
    delta: input.delta,
    stockAfter: input.stockAfter,
    reason: input.reason,
    note: input.note ?? null,
    order: input.order?._id ?? null,
    orderNumber: input.order?.orderNumber ?? null,
    byAdmin: input.actor ? new Types.ObjectId(input.actor.id) : null,
    byEmail: input.actor?.email ?? null,
  });
};

// ── Low-level atomic stock operations ───────────────────────────────────────

// Removes `quantity` only if that many are on hand, in one atomic update — two
// orders racing for the last copy can never both succeed. Returns the new
// stock, or null if there weren't enough.
const takeStock = async (
  itemType: ItemType,
  id: Types.ObjectId | string,
  quantity: number
): Promise<number | null> => {
  const updated = await stockModelFor(itemType)
    .findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    )
    .lean()
    .exec();
  return updated ? (updated.stock ?? null) : null;
};

// Adds stock back to a tracked item. Returns null if the item is gone or no
// longer tracked (nothing to put back into).
const putBackStock = async (
  itemType: ItemType,
  id: Types.ObjectId | string,
  quantity: number
): Promise<number | null> => {
  const updated = await stockModelFor(itemType)
    .findOneAndUpdate(
      { _id: id, stock: { $type: 'number' } },
      { $inc: { stock: quantity } },
      { new: true }
    )
    .lean()
    .exec();
  return updated ? (updated.stock ?? null) : null;
};

const setStockValue = async (
  itemType: ItemType,
  id: Types.ObjectId | string,
  stock: number | null
): Promise<void> => {
  await stockModelFor(itemType).updateOne({ _id: id }, { $set: { stock } }).exec();
};

// ── Admin: manual adjustments ───────────────────────────────────────────────

const DEFAULT_REASON: Record<'add' | 'remove' | 'set', ManualStockReason> = {
  add: 'restock',
  remove: 'shop_sale',
  set: 'correction',
};

export const adjustStock = async (
  ref: ItemRef,
  input: AdjustStockInput,
  actor: Actor
): Promise<InventoryItemDto> => {
  const item = await loadCatalogItem(ref);
  if (!item) throw new NotFoundError('Item not found');

  const note = input.note ?? null;

  if (input.mode === 'untrack') {
    if (item.stock !== null) {
      await setStockValue(item.itemType, item._id, null);
      await recordMovement({
        item,
        delta: 0,
        stockAfter: null,
        reason: 'tracking_stopped',
        note,
        actor,
      });
    }
  } else {
    const quantity = input.quantity;
    const reason = input.reason ?? DEFAULT_REASON[input.mode];

    if (input.mode === 'set' || (input.mode === 'add' && item.stock === null)) {
      // Setting an absolute count (or adding to an untracked item, which
      // starts tracking at that count).
      await setStockValue(item.itemType, item._id, quantity);
      await recordMovement({
        item,
        delta: quantity - (item.stock ?? 0),
        stockAfter: quantity,
        reason: item.stock === null ? 'tracking_started' : reason,
        note,
        actor,
      });
    } else if (input.mode === 'add') {
      const stockAfter = await putBackStock(item.itemType, item._id, quantity);
      await recordMovement({ item, delta: quantity, stockAfter, reason, note, actor });
    } else {
      if (item.stock === null) {
        throw new ConflictError('Stock is not being tracked for this item yet');
      }
      const stockAfter = await takeStock(item.itemType, item._id, quantity);
      if (stockAfter === null) {
        throw new ConflictError(`Only ${item.stock} in stock — cannot remove ${quantity}`);
      }
      await recordMovement({ item, delta: -quantity, stockAfter, reason, note, actor });
    }
  }

  const [updated, defaultThreshold] = await Promise.all([
    loadCatalogItem(ref),
    getDefaultLowStockThreshold(),
  ]);
  return toInventoryItemDto(updated!, defaultThreshold);
};

// Used by the book/product forms: the admin typed a stock number into the
// form, so record it as a correction (or as tracking starting/stopping).
export const applyStockFromForm = async (
  item: Pick<CatalogItem, 'itemType' | '_id' | 'title'>,
  previousStock: number | null,
  nextStock: number | null,
  actor: Actor
): Promise<void> => {
  if (previousStock === nextStock) return;
  await setStockValue(item.itemType, item._id, nextStock);
  await recordMovement({
    item,
    delta: (nextStock ?? 0) - (previousStock ?? 0),
    stockAfter: nextStock,
    reason:
      nextStock === null
        ? 'tracking_stopped'
        : previousStock === null
          ? 'tracking_started'
          : 'correction',
    note: 'Updated from the item form',
    actor,
  });
};

export const listInventory = async (filters: ListInventoryQuery): Promise<InventoryItemDto[]> => {
  const [items, defaultThreshold] = await Promise.all([
    loadAllCatalogItems(),
    getDefaultLowStockThreshold(),
  ]);
  const search = filters.search?.toLowerCase();

  return items
    .map((item) => toInventoryItemDto(item, defaultThreshold))
    .filter((item) => !filters.itemType || item.itemType === filters.itemType)
    .filter(
      (item) =>
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.subtitle.toLowerCase().includes(search)
    )
    .filter((item) => {
      switch (filters.status) {
        case 'low':
          return item.stockStatus === 'low_stock';
        case 'out':
          return item.stockStatus === 'out_of_stock';
        case 'attention':
          return item.stockStatus === 'low_stock' || item.stockStatus === 'out_of_stock';
        case 'untracked':
          return item.stockStatus === 'untracked';
        default:
          return true;
      }
    });
};

export const countStockAlerts = async (): Promise<{ lowStock: number; outOfStock: number }> => {
  const items = await listInventory({ status: 'attention' });
  return {
    lowStock: items.filter((item) => item.stockStatus === 'low_stock').length,
    outOfStock: items.filter((item) => item.stockStatus === 'out_of_stock').length,
  };
};

export const listMovements = async (ref: ItemRef): Promise<StockMovementDto[]> => {
  const movements = await StockMovement.find({ itemType: ref.itemType, item: ref.itemId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(200)
    .lean<StockMovementLean[]>()
    .exec();
  return movements.map(toMovementDto);
};

// ── Orders ──────────────────────────────────────────────────────────────────

export interface OrderStockLine {
  itemType: ItemType;
  item: Types.ObjectId;
  title: string;
  quantity: number;
}

export interface StockShortage {
  title: string;
  requested: number;
  available: number;
}

export type DeductResult =
  { ok: true; deducted: boolean[] } | { ok: false; shortages: StockShortage[] };

// Takes stock for every tracked line of an order, all or nothing: if any line
// is short, whatever was already taken is put back. `deducted[i]` says whether
// line i was actually taken (untracked items are skipped), so a later
// cancellation knows exactly what to return.
export const deductForOrder = async (
  order: { _id: Types.ObjectId; orderNumber: string },
  lines: OrderStockLine[],
  actor: Actor | null
): Promise<DeductResult> => {
  const deducted: boolean[] = [];
  const taken: Array<{ line: OrderStockLine; stockAfter: number }> = [];
  const shortages: StockShortage[] = [];

  for (const line of lines) {
    const current = await stockModelFor(line.itemType)
      .findById(line.item)
      .select('stock')
      .lean()
      .exec();

    // Deleted items and untracked items have nothing to deduct.
    if (!current || current.stock === null || current.stock === undefined) {
      deducted.push(false);
      continue;
    }

    const stockAfter = await takeStock(line.itemType, line.item, line.quantity);
    if (stockAfter === null) {
      shortages.push({ title: line.title, requested: line.quantity, available: current.stock });
      deducted.push(false);
      break;
    }
    taken.push({ line, stockAfter });
    deducted.push(true);
  }

  if (shortages.length > 0) {
    for (const { line } of taken) {
      await putBackStock(line.itemType, line.item, line.quantity);
    }
    return { ok: false, shortages };
  }

  for (const { line, stockAfter } of taken) {
    await recordMovement({
      item: { itemType: line.itemType, _id: line.item, title: line.title },
      delta: -line.quantity,
      stockAfter,
      reason: 'order_paid',
      order,
      actor,
    });
  }

  return { ok: true, deducted };
};

// Returns stock for the lines that were deducted earlier.
export const restoreForOrder = async (
  order: { _id: Types.ObjectId; orderNumber: string },
  lines: Array<OrderStockLine & { stockDeducted: boolean }>,
  reason: 'order_cancelled' | 'payment_reverted',
  actor: Actor | null
): Promise<void> => {
  for (const line of lines) {
    if (!line.stockDeducted) continue;
    const stockAfter = await putBackStock(line.itemType, line.item, line.quantity);
    // If the item was deleted or stopped being tracked, there's nothing to
    // put the copies back into.
    if (stockAfter === null) continue;
    await recordMovement({
      item: { itemType: line.itemType, _id: line.item, title: line.title },
      delta: line.quantity,
      stockAfter,
      reason,
      order,
      actor,
    });
  }
};

export type { Actor, StockInfo };
