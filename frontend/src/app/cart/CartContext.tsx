import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ItemType, OrderLineInput } from '@/app/api/types';

export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_LINES = 20;

/**
 * What the cart remembers about each item. Title/price are only a display
 * snapshot for while the server quote loads — the server re-prices every
 * line, so a stale snapshot can never change what the customer is charged.
 */
export interface CartLine {
  itemType: ItemType;
  itemId: string;
  quantity: number;
  title: string;
  subtitle: string;
  price: number;
  coverImageUrl: string | null;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (itemType: ItemType, itemId: string, quantity: number) => void;
  remove: (itemType: ItemType, itemId: string) => void;
  clear: () => void;
  has: (itemType: ItemType, itemId: string) => boolean;
  toOrderLines: () => OrderLineInput[];
}

const STORAGE_KEY = 'lantern-cart';

const CartContext = createContext<CartContextValue | null>(null);

const isCartLine = (value: unknown): value is CartLine => {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return (
    (line.itemType === 'book' || line.itemType === 'product') &&
    typeof line.itemId === 'string' &&
    typeof line.quantity === 'number' &&
    typeof line.title === 'string' &&
    typeof line.price === 'number'
  );
};

// Browser storage can be unavailable (private mode, blocked site data), so
// every read/write is guarded and the cart still works in memory.
function loadLines(): CartLine[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown;
    return Array.isArray(stored) ? stored.filter(isCartLine).slice(0, MAX_CART_LINES) : [];
  } catch {
    return [];
  }
}

function saveLines(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Ignore — the cart just won't survive a reload.
  }
}

const clampQuantity = (quantity: number) =>
  Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(quantity)));

const sameItem = (line: CartLine, itemType: ItemType, itemId: string) =>
  line.itemType === itemType && line.itemId === itemId;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines);

  useEffect(() => saveLines(lines), [lines]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setLines(loadLines());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((item) => sameItem(item, line.itemType, line.itemId));
      if (existing) {
        return current.map((item) =>
          item === existing
            ? { ...item, ...line, quantity: clampQuantity(item.quantity + quantity) }
            : item
        );
      }
      if (current.length >= MAX_CART_LINES) return current;
      return [...current, { ...line, quantity: clampQuantity(quantity) }];
    });
  }, []);

  const setQuantity = useCallback((itemType: ItemType, itemId: string, quantity: number) => {
    setLines((current) =>
      current.map((item) =>
        sameItem(item, itemType, itemId) ? { ...item, quantity: clampQuantity(quantity) } : item
      )
    );
  }, []);

  const remove = useCallback((itemType: ItemType, itemId: string) => {
    setLines((current) => current.filter((item) => !sameItem(item, itemType, itemId)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      has: (itemType, itemId) => lines.some((line) => sameItem(line, itemType, itemId)),
      toOrderLines: () =>
        lines.map(({ itemType, itemId, quantity }) => ({ itemType, itemId, quantity })),
    }),
    [lines, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
