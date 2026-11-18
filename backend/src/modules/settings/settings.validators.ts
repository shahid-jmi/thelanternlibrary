import { z } from 'zod';
import { INDIAN_STATES } from '../orders/order.constants.js';

const rupees = (label: string) =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .int(`${label} must be a whole number of rupees`)
    .min(0, `${label} cannot be negative`);

const region = (label: string) =>
  z.object({
    rates: z.object({
      light: rupees(`${label} light rate`),
      standard: rupees(`${label} standard rate`),
      heavy: rupees(`${label} heavy rate`),
    }),
    itemsIncluded: z.coerce
      .number({ message: `${label} items included must be a number` })
      .int(`${label} items included must be a whole number`)
      .min(1, `${label} items included must be at least 1`),
    extraItemCharge: rupees(`${label} extra item charge`),
    estimate: z.string().trim().max(80, `${label} estimate is too long`),
  });

const optionalEmail = z
  .union([z.literal(''), z.null(), z.string().trim().email('Enter a valid email address')])
  .transform((value) => (value ? value : null));

export const updateSettingsBodySchema = z.object({
  store: z.object({
    name: z.string().trim().min(1, 'Store name is required').max(120, 'Store name is too long'),
    address: z.string().trim().max(300, 'Store address is too long'),
    phone: z.string().trim().max(30, 'Store phone is too long'),
    email: optionalEmail,
  }),
  notificationEmail: optionalEmail,
  delivery: z.object({
    localStates: z.array(z.enum(INDIAN_STATES, { message: 'Select valid states' })),
    local: region('Local'),
    domestic: region('Rest of India'),
    freeDeliveryThreshold: z.union([z.null(), rupees('Free delivery threshold')]),
    processingTime: z.string().trim().max(80, 'Processing time is too long'),
  }),
  inventory: z.object({
    defaultLowStockThreshold: z.coerce
      .number({ message: 'Low-stock level must be a number' })
      .int('Low-stock level must be a whole number')
      .min(0, 'Low-stock level cannot be negative'),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsBodySchema>;
