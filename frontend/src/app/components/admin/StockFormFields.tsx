import { useTranslation } from 'react-i18next';
import { SHIPPING_CLASSES, type ShippingClass } from '@/app/api/types';
import { FieldInput, FieldSelect } from '@/app/components/FormField';

export interface StockFormValues {
  /** Blank = stock not tracked. */
  stock: string;
  /** Blank = store default. */
  lowStockThreshold: string;
  /** Blank = default (books) or the category's class (products). */
  shippingClass: ShippingClass | '';
}

export const toStockFormValues = (
  item?: {
    stock: number | null;
    lowStockThreshold: number | null;
    shippingClass: ShippingClass | null;
  } | null
): StockFormValues => ({
  stock: item?.stock === null || item?.stock === undefined ? '' : String(item.stock),
  lowStockThreshold:
    item?.lowStockThreshold === null || item?.lowStockThreshold === undefined
      ? ''
      : String(item.lowStockThreshold),
  shippingClass: item?.shippingClass ?? '',
});

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());

/** Returns an error key per invalid field (blank is always valid). */
export const validateStockForm = (values: StockFormValues) => ({
  stock: values.stock.trim() && !isWholeNumber(values.stock) ? 'validation.wholeNumber' : undefined,
  lowStockThreshold:
    values.lowStockThreshold.trim() && !isWholeNumber(values.lowStockThreshold)
      ? 'validation.wholeNumber'
      : undefined,
});

export const toStockPayload = (values: StockFormValues) => ({
  stock: values.stock.trim() ? Number(values.stock) : null,
  lowStockThreshold: values.lowStockThreshold.trim() ? Number(values.lowStockThreshold) : null,
  shippingClass: values.shippingClass || null,
});

export default function StockFormFields({
  idPrefix,
  values,
  onChange,
  showErrors,
  inheritLabel,
}: {
  idPrefix: string;
  values: StockFormValues;
  onChange: (values: StockFormValues) => void;
  showErrors: boolean;
  /** Label for the "no override" shipping class option. */
  inheritLabel: string;
}) {
  const { t } = useTranslation();
  const errors = validateStockForm(values);

  return (
    <>
      <FieldInput
        id={`${idPrefix}-stock`}
        type="number"
        min="0"
        step="1"
        label={t('admin.stock.quantity')}
        hint={t('admin.stock.quantityHint')}
        value={values.stock}
        onChange={(stock) => onChange({ ...values, stock })}
        error={showErrors && errors.stock ? t(errors.stock) : undefined}
      />
      <FieldInput
        id={`${idPrefix}-low-stock`}
        type="number"
        min="0"
        step="1"
        label={t('admin.stock.lowStockLevel')}
        hint={t('admin.stock.lowStockLevelHint')}
        value={values.lowStockThreshold}
        onChange={(lowStockThreshold) => onChange({ ...values, lowStockThreshold })}
        error={showErrors && errors.lowStockThreshold ? t(errors.lowStockThreshold) : undefined}
      />
      <FieldSelect
        id={`${idPrefix}-shipping-class`}
        label={t('admin.stock.shippingClass')}
        value={values.shippingClass}
        onChange={(value) => onChange({ ...values, shippingClass: value as ShippingClass | '' })}
      >
        <option value="">{inheritLabel}</option>
        {SHIPPING_CLASSES.map((item) => (
          <option key={item} value={item}>
            {t(`admin.stock.class.${item}`)}
          </option>
        ))}
      </FieldSelect>
    </>
  );
}
