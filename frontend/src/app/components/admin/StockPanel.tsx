import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  History,
  Minus,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  INVENTORY_FILTERS,
  MANUAL_STOCK_REASONS,
  type InventoryFilter,
  type InventoryItem,
  type ItemType,
  type ManualStockReason,
  type StockStatus,
} from '@/app/api/types';
import { getErrorMessage } from '@/app/api/client';
import { useAdjustStock, useInventory, useStockMovements } from '@/app/queries/inventory';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import { cn } from '@/app/lib/cn';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { FieldInput, FieldSelect } from '@/app/components/FormField';
import { Button, EmptyTableRow, Table, TableHead, TableRow, Td, Th } from '@/app/components/ui';

type AdjustMode = 'add' | 'remove' | 'set' | 'untrack';

const DEFAULT_REASON: Record<Exclude<AdjustMode, 'untrack'>, ManualStockReason> = {
  add: 'restock',
  remove: 'shop_sale',
  set: 'correction',
};

const STATUS_STYLES: Record<StockStatus, string> = {
  in_stock: 'text-emerald-600 dark:text-emerald-400',
  low_stock: 'text-amber-600 dark:text-amber-400',
  out_of_stock: 'text-destructive',
  untracked: 'opacity-60',
};

export default function StockPanel() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<InventoryFilter>('attention');
  const [itemType, setItemType] = useState<ItemType | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [adjusting, setAdjusting] = useState<{ item: InventoryItem; mode: AdjustMode } | null>(
    null
  );
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const inventoryQuery = useInventory({
    status,
    itemType: itemType || undefined,
    search: debouncedSearch.trim() || undefined,
  });
  const items = inventoryQuery.data ?? [];
  const error = inventoryQuery.isError ? getErrorMessage(inventoryQuery.error) : '';

  return (
    <section>
      <p className="mb-4 max-w-2xl text-sm opacity-70">{t('admin.stock.intro')}</p>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {INVENTORY_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={status === item}
            onClick={() => setStatus(item)}
            className={cn(
              'h-9 shrink-0 rounded-sm border px-3 text-sm transition',
              status === item
                ? 'border-ember bg-ember/10 text-ember'
                : 'border-border hover:bg-secondary'
            )}
          >
            {t(`admin.stock.filter.${item}`)}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:left-auto rtl:right-3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.stock.search')}
            className="h-11 w-full min-w-64 rounded-sm border border-border bg-input-background px-9 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
          />
        </div>
        <select
          value={itemType}
          onChange={(event) => setItemType(event.target.value as ItemType | '')}
          className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
        >
          <option value="">{t('admin.stock.allItems')}</option>
          <option value="book">{t('admin.dashboard.tab.books')}</option>
          <option value="product">{t('admin.dashboard.tab.products')}</option>
        </select>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {inventoryQuery.isPending ? (
        <Loader label={t('admin.stock.loading')} />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>{t('admin.stock.item')}</Th>
              <Th>{t('admin.stock.inStock')}</Th>
              <Th>{t('admin.stock.lowStockLevel')}</Th>
              <Th>{t('admin.admins.actions')}</Th>
            </tr>
          </TableHead>
          <tbody>
            {items.length === 0 && (
              <EmptyTableRow
                colSpan={4}
                message={
                  status === 'attention' ? t('admin.stock.allGood') : t('admin.stock.noItems')
                }
              />
            )}
            {items.map((item) => (
              <TableRow key={`${item.itemType}-${item._id}`}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center opacity-50">
                          {item.itemType === 'book' ? (
                            <BookOpen className="h-4 w-4" />
                          ) : (
                            <Package className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate">{item.title}</div>
                      <div className="truncate text-xs opacity-60">
                        {item.subtitle}
                        {!item.isAvailable && ` · ${t('admin.stock.hidden')}`}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="text-lg leading-none">{item.stock ?? '—'}</div>
                  <div className={cn('mt-1 text-xs', STATUS_STYLES[item.stockStatus])}>
                    {t(`admin.stock.status.${item.stockStatus}`)}
                  </div>
                </Td>
                <Td>
                  {item.stock === null ? (
                    <span className="opacity-50">—</span>
                  ) : (
                    <span className={item.lowStockThreshold === null ? 'opacity-60' : ''}>
                      {item.effectiveLowStockThreshold}
                      {item.lowStockThreshold === null && ` (${t('admin.stock.default')})`}
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdjusting({ item, mode: 'add' })}
                    >
                      <Plus className="h-4 w-4" />
                      {t('admin.stock.add')}
                    </Button>
                    {item.stock !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={item.stock === 0}
                        onClick={() => setAdjusting({ item, mode: 'remove' })}
                      >
                        <Minus className="h-4 w-4" />
                        {t('admin.stock.remove')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdjusting({ item, mode: 'set' })}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {t('admin.stock.set')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setHistoryItem(item)}>
                      <History className="h-4 w-4" />
                      {t('admin.stock.history')}
                    </Button>
                  </div>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {adjusting && (
        <AdjustStockDialog
          key={`${adjusting.item._id}-${adjusting.mode}`}
          item={adjusting.item}
          initialMode={adjusting.mode}
          onClose={() => setAdjusting(null)}
        />
      )}
      {historyItem && (
        <StockHistoryDialog item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </section>
  );
}

function AdjustStockDialog({
  item,
  initialMode,
  onClose,
}: {
  item: InventoryItem;
  initialMode: AdjustMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const adjustStock = useAdjustStock();
  const [mode, setMode] = useState<AdjustMode>(initialMode);
  const [quantity, setQuantity] = useState(
    initialMode === 'set' && item.stock !== null ? String(item.stock) : ''
  );
  const [reason, setReason] = useState<ManualStockReason>(
    DEFAULT_REASON[initialMode === 'untrack' ? 'set' : initialMode]
  );
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState('');

  const modes: AdjustMode[] =
    item.stock === null ? ['add', 'set'] : ['add', 'remove', 'set', 'untrack'];
  const parsed = Number(quantity);
  const minimum = mode === 'set' ? 0 : 1;
  const quantityInvalid =
    mode !== 'untrack' &&
    (!/^\d+$/.test(quantity.trim()) ||
      parsed < minimum ||
      (mode === 'remove' && parsed > (item.stock ?? 0)));

  const preview =
    mode === 'untrack' || quantityInvalid
      ? null
      : mode === 'add'
        ? (item.stock ?? 0) + parsed
        : mode === 'remove'
          ? (item.stock ?? 0) - parsed
          : parsed;

  const changeMode = (next: AdjustMode) => {
    setMode(next);
    if (next !== 'untrack') setReason(DEFAULT_REASON[next]);
    setQuantity(next === 'set' && item.stock !== null ? String(item.stock) : '');
    setShowErrors(false);
  };

  const submit = async () => {
    setShowErrors(true);
    if (quantityInvalid) return;
    try {
      await adjustStock.mutateAsync({
        itemType: item.itemType,
        id: item._id,
        adjustment:
          mode === 'untrack'
            ? { mode, note: note.trim() || undefined }
            : { mode, quantity: parsed, reason, note: note.trim() || undefined },
      });
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('admin.stock.adjustTitle')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md rounded-sm border border-border bg-popover p-6 text-popover-foreground">
        <h2 className="text-lg tracking-[0.05em]">{item.title}</h2>
        <p className="mt-1 text-sm opacity-70">
          {item.stock === null
            ? t('admin.stock.notTrackedYet')
            : t('admin.stock.currentStock', { count: item.stock })}
        </p>

        <div
          className="mt-4 grid grid-cols-4 gap-1 rounded-sm border border-border p-1"
          role="tablist"
        >
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => changeMode(item)}
              className={cn(
                'h-8 rounded-sm text-xs transition',
                mode === item ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
              )}
            >
              {t(`admin.stock.mode.${item}`)}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {mode === 'untrack' ? (
            <p className="mb-4 text-sm opacity-80">{t('admin.stock.untrackExplain')}</p>
          ) : (
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FieldInput
                id="stock-quantity"
                type="number"
                min={String(minimum)}
                step="1"
                label={mode === 'set' ? t('admin.stock.newCount') : t('admin.stock.howMany')}
                value={quantity}
                onChange={setQuantity}
                error={
                  showErrors && quantityInvalid
                    ? mode === 'remove' && parsed > (item.stock ?? 0)
                      ? t('admin.stock.tooMany', { count: item.stock ?? 0 })
                      : t('validation.wholeNumber')
                    : undefined
                }
              />
              <FieldSelect
                id="stock-reason"
                label={t('admin.stock.reason')}
                value={reason}
                onChange={(value) => setReason(value as ManualStockReason)}
              >
                {MANUAL_STOCK_REASONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`admin.stock.reasons.${value}`)}
                  </option>
                ))}
              </FieldSelect>
            </div>
          )}
          <FieldInput
            id="stock-note"
            label={t('admin.orders.noteOptional')}
            value={note}
            onChange={setNote}
          />
          {preview !== null && (
            <p className="-mt-2 text-sm">
              {t('admin.stock.after')}: <span className="text-ember">{preview}</span>
            </p>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-3">
          <Button className="flex-1" loading={adjustStock.isPending} onClick={submit}>
            {t('admin.stock.save')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('admin.form.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StockHistoryDialog({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { t } = useTranslation();
  const movementsQuery = useStockMovements(item.itemType, item._id);
  const movements = movementsQuery.data ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('admin.stock.historyTitle')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-sm border border-border bg-popover p-6 text-popover-foreground">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg tracking-[0.05em]">{t('admin.stock.historyTitle')}</h2>
            <p className="text-sm opacity-70">{item.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('admin.form.cancel')}
            className="rounded-sm p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto">
          {movementsQuery.isPending && <Loader label={t('admin.stock.loading')} />}
          {movementsQuery.isError && (
            <StatusMessage tone="error">{getErrorMessage(movementsQuery.error)}</StatusMessage>
          )}
          {!movementsQuery.isPending && movements.length === 0 && (
            <p className="text-sm opacity-70">{t('admin.stock.noHistory')}</p>
          )}
          <ul className="divide-y divide-border text-sm">
            {movements.map((movement) => (
              <li key={movement._id} className="flex items-start justify-between gap-4 py-2.5">
                <div>
                  <div>
                    {t(`admin.stock.reasons.${movement.reason}`)}
                    {movement.orderNumber && ` · ${movement.orderNumber}`}
                  </div>
                  {movement.note && <div className="text-xs opacity-70">{movement.note}</div>}
                  <div className="text-xs opacity-50">
                    {new Date(movement.createdAt).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {movement.byEmail && ` · ${movement.byEmail}`}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={cn(
                      movement.delta > 0 && 'text-emerald-600 dark:text-emerald-400',
                      movement.delta < 0 && 'text-destructive'
                    )}
                  >
                    {movement.delta > 0 ? `+${movement.delta}` : movement.delta || '—'}
                  </div>
                  <div className="text-xs opacity-60">
                    {movement.stockAfter === null
                      ? t('admin.stock.notTracked')
                      : `= ${movement.stockAfter}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
