import { describe, expect, it } from 'vitest';
import { calculateDelivery } from './delivery.js';
import { DEFAULT_SETTINGS } from '../settings/settings.model.js';

const settings = DEFAULT_SETTINGS.delivery;

describe('calculateDelivery', () => {
  it('charges the local rate for the heaviest item class', () => {
    const quote = calculateDelivery(
      [
        { shippingClass: 'light', quantity: 1 },
        { shippingClass: 'heavy', quantity: 1 },
      ],
      500,
      'Jammu and Kashmir',
      settings
    );
    expect(quote).toMatchObject({ region: 'local', charge: 90, isFree: false });
  });

  it('adds a charge per item beyond those included', () => {
    const quote = calculateDelivery(
      [{ shippingClass: 'standard', quantity: 4 }],
      800,
      'Delhi',
      settings
    );
    expect(quote.charge).toBe(90 + 2 * 20);
  });

  it('is free at or above the threshold', () => {
    const quote = calculateDelivery(
      [{ shippingClass: 'heavy', quantity: 1 }],
      1500,
      'Delhi',
      settings
    );
    expect(quote).toMatchObject({ charge: 0, isFree: true });
  });

  it('has no threshold when it is null', () => {
    const quote = calculateDelivery([{ shippingClass: 'light', quantity: 1 }], 99999, 'Delhi', {
      ...settings,
      freeDeliveryThreshold: null,
    });
    expect(quote.charge).toBe(60);
  });
});
