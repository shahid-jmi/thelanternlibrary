import { SHIPPING_CLASSES, type ShippingClass } from '../../common/constants/catalog.js';
import type { DeliverySettings } from '../settings/settings.model.js';

export interface DeliveryLine {
  shippingClass: ShippingClass;
  quantity: number;
}

export type DeliveryRegionKey = 'local' | 'domestic';

export interface DeliveryQuote {
  region: DeliveryRegionKey;
  charge: number;
  isFree: boolean;
  estimate: string;
}

const heaviestClass = (lines: DeliveryLine[]): ShippingClass =>
  lines.reduce<ShippingClass>(
    (heaviest, line) =>
      SHIPPING_CLASSES.indexOf(line.shippingClass) > SHIPPING_CLASSES.indexOf(heaviest)
        ? line.shippingClass
        : heaviest,
    'light'
  );

export const regionForState = (state: string, settings: DeliverySettings): DeliveryRegionKey =>
  settings.localStates.includes(state) ? 'local' : 'domestic';

// Delivery = base rate for the region and the heaviest item's class
//          + a charge for each item beyond the ones the base rate covers,
//          → free once the subtotal reaches the free-delivery threshold.
export const calculateDelivery = (
  lines: DeliveryLine[],
  subtotal: number,
  state: string,
  settings: DeliverySettings
): DeliveryQuote => {
  const regionKey = regionForState(state, settings);
  const region = settings[regionKey];

  const threshold = settings.freeDeliveryThreshold;
  if (lines.length === 0 || (threshold !== null && subtotal >= threshold)) {
    return { region: regionKey, charge: 0, isFree: lines.length > 0, estimate: region.estimate };
  }

  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  const extraItems = Math.max(0, totalItems - region.itemsIncluded);
  const charge = region.rates[heaviestClass(lines)] + extraItems * region.extraItemCharge;

  return { region: regionKey, charge, isFree: false, estimate: region.estimate };
};
