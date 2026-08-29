import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/app/lib/format';

describe('formatPrice', () => {
  it('formats with the ₹ symbol and rounds to whole rupees', () => {
    expect(formatPrice(15.99)).toBe('₹16');
    expect(formatPrice(15.4)).toBe('₹15');
  });

  it('handles whole numbers', () => {
    expect(formatPrice(12)).toBe('₹12');
  });
});
