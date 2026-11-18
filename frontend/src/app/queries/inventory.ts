import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adjustStock, getInventory, getStockMovements } from '@/app/api/inventory';
import type { InventoryFilter, ItemType, StockAdjustment } from '@/app/api/types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filters: { status: InventoryFilter; itemType?: ItemType; search?: string }) =>
    ['inventory', 'list', filters] as const,
  movements: (itemType: ItemType, id: string) => ['inventory', 'movements', itemType, id] as const,
};

export function useInventory(filters: {
  status: InventoryFilter;
  itemType?: ItemType;
  search?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => getInventory(filters),
    placeholderData: keepPreviousData,
  });
}

export function useStockMovements(itemType: ItemType, id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.movements(itemType, id ?? ''),
    queryFn: () => getStockMovements(itemType, id!),
    enabled: Boolean(id),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemType,
      id,
      adjustment,
    }: {
      itemType: ItemType;
      id: string;
      adjustment: StockAdjustment;
    }) => adjustStock(itemType, id, adjustment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['orders', 'dashboard'] });
    },
  });
}
