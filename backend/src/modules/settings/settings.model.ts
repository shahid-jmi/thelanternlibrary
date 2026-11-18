import mongoose, { Schema } from 'mongoose';
import type { ShippingClass } from '../../common/constants/catalog.js';

export type ClassRates = Record<ShippingClass, number>;

export interface DeliveryRegion {
  // Charge for a parcel whose heaviest item is of this class.
  rates: ClassRates;
  // Items covered by the base rate before extraItemCharge applies.
  itemsIncluded: number;
  extraItemCharge: number;
  // Shown to customers, e.g. "2–4 business days".
  estimate: string;
}

export interface DeliverySettings {
  // States billed at the "local" rate; everything else is "domestic".
  localStates: string[];
  local: DeliveryRegion;
  domestic: DeliveryRegion;
  // null = no free delivery.
  freeDeliveryThreshold: number | null;
  // Shown to customers, e.g. "Ships within 1–2 business days".
  processingTime: string;
}

export interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  email: string | null;
}

export interface StoreSettingsAttrs {
  key: 'store';
  store: StoreDetails;
  // Where new-order alerts go. null = no alert email.
  notificationEmail: string | null;
  delivery: DeliverySettings;
  inventory: { defaultLowStockThreshold: number };
}

export interface StoreSettingsLean extends StoreSettingsAttrs {
  updatedAt?: Date;
}

// Placeholder values until the shop sets real ones from the admin panel.
export const DEFAULT_SETTINGS: StoreSettingsAttrs = {
  key: 'store',
  store: {
    name: 'The Lantern Library',
    address: 'Srinagar, Kashmir',
    phone: '',
    email: null,
  },
  notificationEmail: null,
  delivery: {
    localStates: ['Jammu and Kashmir', 'Ladakh'],
    local: {
      rates: { light: 40, standard: 50, heavy: 90 },
      itemsIncluded: 2,
      extraItemCharge: 20,
      estimate: '2–4 business days',
    },
    domestic: {
      rates: { light: 60, standard: 90, heavy: 150 },
      itemsIncluded: 2,
      extraItemCharge: 20,
      estimate: '5–8 business days',
    },
    freeDeliveryThreshold: 1500,
    processingTime: 'Ships within 1–2 business days',
  },
  inventory: { defaultLowStockThreshold: 2 },
};

const classRatesSchema = new Schema<ClassRates>(
  {
    light: { type: Number, required: true, min: 0 },
    standard: { type: Number, required: true, min: 0 },
    heavy: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const regionSchema = new Schema<DeliveryRegion>(
  {
    rates: { type: classRatesSchema, required: true },
    itemsIncluded: { type: Number, required: true, min: 1 },
    extraItemCharge: { type: Number, required: true, min: 0 },
    estimate: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const settingsSchema = new Schema<StoreSettingsAttrs>(
  {
    // Single-document collection: there is exactly one "store" settings row.
    key: { type: String, enum: ['store'], required: true, unique: true },
    store: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: null },
    },
    notificationEmail: { type: String, trim: true, default: null },
    delivery: {
      localStates: { type: [String], default: [] },
      local: { type: regionSchema, required: true },
      domestic: { type: regionSchema, required: true },
      freeDeliveryThreshold: { type: Number, default: null, min: 0 },
      processingTime: { type: String, trim: true, default: '' },
    },
    inventory: {
      defaultLowStockThreshold: { type: Number, required: true, min: 0 },
    },
  },
  { timestamps: true, versionKey: false }
);

const StoreSettings = mongoose.model('StoreSettings', settingsSchema);

export default StoreSettings;
