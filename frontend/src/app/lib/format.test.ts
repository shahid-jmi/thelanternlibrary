import { describe, expect, it } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats a price with the Rs prefix', () => {
    expect(formatPrice(15.99)).toMatch(/15\.99/);
    expect(formatPrice(15.99)).toMatch(/^Rs /);
  });

  it('handles whole numbers', () => {
    expect(formatPrice(12)).toMatch(/12/);
  });
});
