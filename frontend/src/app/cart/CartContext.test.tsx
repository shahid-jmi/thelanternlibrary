import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, MAX_LINE_QUANTITY, useCart } from '@/app/cart/CartContext';

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const book = {
  itemType: 'book' as const,
  itemId: 'b1',
  title: 'The Alchemist',
  subtitle: 'Paulo Coelho',
  price: 400,
  coverImageUrl: null,
};

beforeEach(() => localStorage.clear());

describe('CartContext', () => {
  it('merges repeat adds of the same item and counts items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add(book));
    act(() => result.current.add(book, 2));
    act(() => result.current.add({ ...book, itemType: 'product', itemId: 'p1' }));

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.lines[0]?.quantity).toBe(3);
    expect(result.current.itemCount).toBe(4);
    expect(result.current.toOrderLines()).toEqual([
      { itemType: 'book', itemId: 'b1', quantity: 3 },
      { itemType: 'product', itemId: 'p1', quantity: 1 },
    ]);
  });

  it('keeps quantities between 1 and the maximum', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add(book));
    act(() => result.current.setQuantity('book', 'b1', 0));
    expect(result.current.lines[0]?.quantity).toBe(1);
    act(() => result.current.setQuantity('book', 'b1', 999));
    expect(result.current.lines[0]?.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('survives a reload and ignores corrupt storage', () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.add(book));
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.lines).toHaveLength(1);
    second.unmount();

    localStorage.setItem('lantern-cart', '{not json');
    const third = renderHook(() => useCart(), { wrapper });
    expect(third.result.current.lines).toEqual([]);
  });

  it('removes and clears', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add(book));
    act(() => result.current.remove('book', 'b1'));
    expect(result.current.lines).toEqual([]);
    act(() => result.current.add(book));
    act(() => result.current.clear());
    expect(result.current.itemCount).toBe(0);
  });
});
