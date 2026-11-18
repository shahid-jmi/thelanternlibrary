import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/app/api/client';
import {
  INDIAN_STATES,
  SHIPPING_CLASSES,
  type DeliveryRegionSettings,
  type StoreSettings,
} from '@/app/api/types';
import { useAuth } from '@/app/auth/AuthContext';
import StatusMessage from '@/app/components/StatusMessage';
import Loader from '@/app/components/Loader';
import { FieldInput } from '@/app/components/FormField';
import { Button, Card } from '@/app/components/ui';

const settingsKey = ['admin', 'settings'] as const;

async function getSettings(): Promise<StoreSettings> {
  const { data } = await api.get<StoreSettings>('/admin/settings');
  return data;
}

async function saveSettings(settings: StoreSettings): Promise<StoreSettings> {
  const { data } = await api.put<StoreSettings>('/admin/settings', settings);
  return data;
}

export default function SettingsPanel() {
  const settingsQuery = useQuery({ queryKey: settingsKey, queryFn: getSettings });

  if (settingsQuery.isPending) return <Loader />;
  if (settingsQuery.isError) {
    return <StatusMessage tone="error">{getErrorMessage(settingsQuery.error)}</StatusMessage>;
  }
  // Re-mount the form whenever fresh settings arrive.
  return <SettingsForm key={JSON.stringify(settingsQuery.data)} initial={settingsQuery.data} />;
}

// Number inputs are edited as strings so a half-typed value doesn't jump.
type Draft = {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  notificationEmail: string;
  localStates: string[];
  local: RegionDraft;
  domestic: RegionDraft;
  freeDeliveryThreshold: string;
  processingTime: string;
  defaultLowStockThreshold: string;
};

type RegionDraft = {
  light: string;
  standard: string;
  heavy: string;
  itemsIncluded: string;
  extraItemCharge: string;
  estimate: string;
};

const toRegionDraft = (region: DeliveryRegionSettings): RegionDraft => ({
  light: String(region.rates.light),
  standard: String(region.rates.standard),
  heavy: String(region.rates.heavy),
  itemsIncluded: String(region.itemsIncluded),
  extraItemCharge: String(region.extraItemCharge),
  estimate: region.estimate,
});

const toDraft = (settings: StoreSettings): Draft => ({
  storeName: settings.store.name,
  storeAddress: settings.store.address,
  storePhone: settings.store.phone,
  storeEmail: settings.store.email ?? '',
  notificationEmail: settings.notificationEmail ?? '',
  localStates: settings.delivery.localStates,
  local: toRegionDraft(settings.delivery.local),
  domestic: toRegionDraft(settings.delivery.domestic),
  freeDeliveryThreshold:
    settings.delivery.freeDeliveryThreshold === null
      ? ''
      : String(settings.delivery.freeDeliveryThreshold),
  processingTime: settings.delivery.processingTime,
  defaultLowStockThreshold: String(settings.inventory.defaultLowStockThreshold),
});

const isWhole = (value: string, min = 0) => /^\d+$/.test(value.trim()) && Number(value) >= min;

const toRegion = (draft: RegionDraft): DeliveryRegionSettings => ({
  rates: {
    light: Number(draft.light),
    standard: Number(draft.standard),
    heavy: Number(draft.heavy),
  },
  itemsIncluded: Number(draft.itemsIncluded),
  extraItemCharge: Number(draft.extraItemCharge),
  estimate: draft.estimate.trim(),
});

function SettingsForm({ initial }: { initial: StoreSettings }) {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [showErrors, setShowErrors] = useState(false);
  const [message, setMessage] = useState('');
  const save = useMutation({
    mutationFn: saveSettings,
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsKey, saved);
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setMessage(t('admin.settings.saved'));
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const updateRegion = (region: 'local' | 'domestic', key: keyof RegionDraft, value: string) =>
    setDraft((current) => ({ ...current, [region]: { ...current[region], [key]: value } }));

  const regionError = (region: RegionDraft, key: keyof RegionDraft) => {
    if (!showErrors || key === 'estimate') return undefined;
    return isWhole(region[key], key === 'itemsIncluded' ? 1 : 0)
      ? undefined
      : t('validation.wholeNumber');
  };

  const invalid =
    !draft.storeName.trim() ||
    !isWhole(draft.defaultLowStockThreshold) ||
    (draft.freeDeliveryThreshold.trim() !== '' && !isWhole(draft.freeDeliveryThreshold)) ||
    (['local', 'domestic'] as const).some((region) =>
      (['light', 'standard', 'heavy', 'itemsIncluded', 'extraItemCharge'] as const).some(
        (key) => !isWhole(draft[region][key], key === 'itemsIncluded' ? 1 : 0)
      )
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    setMessage('');
    if (invalid) return;
    save.mutate({
      store: {
        name: draft.storeName.trim(),
        address: draft.storeAddress.trim(),
        phone: draft.storePhone.trim(),
        email: draft.storeEmail.trim() || null,
      },
      notificationEmail: draft.notificationEmail.trim() || null,
      delivery: {
        localStates: draft.localStates,
        local: toRegion(draft.local),
        domestic: toRegion(draft.domestic),
        freeDeliveryThreshold: draft.freeDeliveryThreshold.trim()
          ? Number(draft.freeDeliveryThreshold)
          : null,
        processingTime: draft.processingTime.trim(),
      },
      inventory: { defaultLowStockThreshold: Number(draft.defaultLowStockThreshold) },
    });
  };

  const region = (key: 'local' | 'domestic') => (
    <Card className="p-5">
      <h3 className="mb-4">{t(`admin.settings.region.${key}`)}</h3>
      <div className="grid gap-x-4 sm:grid-cols-3">
        {SHIPPING_CLASSES.map((shippingClass) => (
          <FieldInput
            key={shippingClass}
            id={`${key}-${shippingClass}`}
            type="number"
            min="0"
            step="1"
            label={t(`admin.settings.rate.${shippingClass}`)}
            value={draft[key][shippingClass]}
            onChange={(value) => updateRegion(key, shippingClass, value)}
            error={regionError(draft[key], shippingClass)}
          />
        ))}
      </div>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <FieldInput
          id={`${key}-included`}
          type="number"
          min="1"
          step="1"
          label={t('admin.settings.itemsIncluded')}
          value={draft[key].itemsIncluded}
          onChange={(value) => updateRegion(key, 'itemsIncluded', value)}
          error={regionError(draft[key], 'itemsIncluded')}
        />
        <FieldInput
          id={`${key}-extra`}
          type="number"
          min="0"
          step="1"
          label={t('admin.settings.extraItemCharge')}
          value={draft[key].extraItemCharge}
          onChange={(value) => updateRegion(key, 'extraItemCharge', value)}
          error={regionError(draft[key], 'extraItemCharge')}
        />
      </div>
      <FieldInput
        id={`${key}-estimate`}
        label={t('admin.settings.estimate')}
        hint={t('admin.settings.estimateHint')}
        value={draft[key].estimate}
        onChange={(value) => updateRegion(key, 'estimate', value)}
      />
    </Card>
  );

  return (
    <form onSubmit={submit} noValidate>
      {!isSuperAdmin && <StatusMessage>{t('admin.settings.readOnly')}</StatusMessage>}
      <fieldset disabled={!isSuperAdmin || save.isPending} className="space-y-6">
        <Card className="p-5">
          <h3 className="mb-4">{t('admin.settings.storeDetails')}</h3>
          <p className="-mt-2 mb-4 text-sm opacity-70">{t('admin.settings.storeDetailsHint')}</p>
          <div className="grid gap-x-4 md:grid-cols-2">
            <FieldInput
              id="store-name"
              label={t('admin.settings.storeName')}
              value={draft.storeName}
              onChange={(value) => update('storeName', value)}
              error={showErrors && !draft.storeName.trim() ? t('validation.required') : undefined}
            />
            <FieldInput
              id="store-phone"
              label={t('order.phone')}
              value={draft.storePhone}
              onChange={(value) => update('storePhone', value)}
            />
            <FieldInput
              id="store-address"
              label={t('admin.settings.storeAddress')}
              value={draft.storeAddress}
              onChange={(value) => update('storeAddress', value)}
            />
            <FieldInput
              id="store-email"
              type="email"
              label={t('admin.settings.storeEmail')}
              value={draft.storeEmail}
              onChange={(value) => update('storeEmail', value)}
            />
            <FieldInput
              id="notification-email"
              type="email"
              label={t('admin.settings.notificationEmail')}
              hint={t('admin.settings.notificationEmailHint')}
              value={draft.notificationEmail}
              onChange={(value) => update('notificationEmail', value)}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1">{t('admin.settings.delivery')}</h3>
          <p className="mb-4 text-sm opacity-70">{t('admin.settings.deliveryHint')}</p>
          <div className="grid gap-x-4 md:grid-cols-2">
            <FieldInput
              id="free-delivery"
              type="number"
              min="0"
              step="1"
              label={t('admin.settings.freeDelivery')}
              hint={t('admin.settings.freeDeliveryHint')}
              value={draft.freeDeliveryThreshold}
              onChange={(value) => update('freeDeliveryThreshold', value)}
              error={
                showErrors &&
                draft.freeDeliveryThreshold.trim() !== '' &&
                !isWhole(draft.freeDeliveryThreshold)
                  ? t('validation.wholeNumber')
                  : undefined
              }
            />
            <FieldInput
              id="processing-time"
              label={t('admin.settings.processingTime')}
              hint={t('admin.settings.processingTimeHint')}
              value={draft.processingTime}
              onChange={(value) => update('processingTime', value)}
            />
          </div>
          <details className="mb-2 text-sm">
            <summary className="cursor-pointer">
              {t('admin.settings.localStates', { count: draft.localStates.length })}
            </summary>
            <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {INDIAN_STATES.map((state) => (
                <label key={state} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.localStates.includes(state)}
                    onChange={(event) =>
                      update(
                        'localStates',
                        event.target.checked
                          ? [...draft.localStates, state]
                          : draft.localStates.filter((item) => item !== state)
                      )
                    }
                  />
                  {state}
                </label>
              ))}
            </div>
          </details>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {region('local')}
          {region('domestic')}
        </div>

        <Card className="p-5">
          <h3 className="mb-4">{t('admin.dashboard.tab.stock')}</h3>
          <div className="max-w-xs">
            <FieldInput
              id="default-low-stock"
              type="number"
              min="0"
              step="1"
              label={t('admin.settings.defaultLowStock')}
              hint={t('admin.settings.defaultLowStockHint')}
              value={draft.defaultLowStockThreshold}
              onChange={(value) => update('defaultLowStockThreshold', value)}
              error={
                showErrors && !isWhole(draft.defaultLowStockThreshold)
                  ? t('validation.wholeNumber')
                  : undefined
              }
            />
          </div>
        </Card>
      </fieldset>

      {isSuperAdmin && (
        <div className="mt-6 flex items-center gap-4">
          <Button loading={save.isPending}>{t('admin.form.save')}</Button>
          {message && <span className="text-sm">{message}</span>}
          {showErrors && invalid && (
            <span className="text-sm text-destructive">{t('admin.settings.fixErrors')}</span>
          )}
        </div>
      )}
    </form>
  );
}
