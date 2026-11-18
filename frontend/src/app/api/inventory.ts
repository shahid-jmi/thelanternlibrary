import { api } from '@/app/api/client';
import type {
  InventoryFilter,
  InventoryItem,
  ItemType,
  StockAdjustment,
  StockMovement,
} from '@/app/api/types';

export async function getInventory(filters: {
  status: InventoryFilter;
  itemType?: ItemType;
  search?: string;
}): Promise<InventoryItem[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  const { data } = await api.get<InventoryItem[]>('/admin/inventory', { params });
  return data;
}

export async function adjustStock(
  itemType: ItemType,
  id: string,
  adjustment: StockAdjustment
): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItem>(
    `/admin/inventory/${itemType}/${id}/adjustments`,
    adjustment
  );
  return data;
}

export async function getStockMovements(itemType: ItemType, id: string): Promise<StockMovement[]> {
  const { data } = await api.get<StockMovement[]>(`/admin/inventory/${itemType}/${id}/movements`);
  return data;
}
