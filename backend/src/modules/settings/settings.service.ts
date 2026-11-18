import StoreSettings, {
  DEFAULT_SETTINGS,
  type StoreSettingsAttrs,
  type StoreSettingsLean,
} from './settings.model.js';
import type { UpdateSettingsInput } from './settings.validators.js';

export type StoreSettingsDto = Omit<StoreSettingsAttrs, 'key'>;

export interface PublicSettingsDto {
  storeName: string;
  freeDeliveryThreshold: number | null;
  processingTime: string;
  localStates: string[];
  estimates: { local: string; domestic: string };
}

const toDto = (settings: StoreSettingsLean): StoreSettingsDto => ({
  store: settings.store,
  notificationEmail: settings.notificationEmail ?? null,
  delivery: settings.delivery,
  inventory: settings.inventory,
});

// Returns the stored settings, falling back to the defaults until an admin
// saves them for the first time — so a fresh database works out of the box.
export const getSettings = async (): Promise<StoreSettingsDto> => {
  const stored = await StoreSettings.findOne({ key: 'store' }).lean<StoreSettingsLean>().exec();
  return toDto(stored ?? DEFAULT_SETTINGS);
};

export const getPublicSettings = async (): Promise<PublicSettingsDto> => {
  const { store, delivery } = await getSettings();
  return {
    storeName: store.name,
    freeDeliveryThreshold: delivery.freeDeliveryThreshold,
    processingTime: delivery.processingTime,
    localStates: delivery.localStates,
    estimates: { local: delivery.local.estimate, domestic: delivery.domestic.estimate },
  };
};

export const updateSettings = async (payload: UpdateSettingsInput): Promise<StoreSettingsDto> => {
  const updated = await StoreSettings.findOneAndUpdate(
    { key: 'store' },
    { ...payload, key: 'store' },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .lean<StoreSettingsLean>()
    .exec();
  return toDto(updated!);
};

export const getDefaultLowStockThreshold = async (): Promise<number> =>
  (await getSettings()).inventory.defaultLowStockThreshold;
