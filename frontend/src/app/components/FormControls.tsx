import { useTranslation } from 'react-i18next';

export function FilterSelect({
  label,
  value,
  onChange,
  values,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  values: readonly string[];
}) {
  const { t } = useTranslation();
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none focus:border-ring"
    >
      <option value="">{t('catalog.filter.all')}</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  values,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  values: readonly string[];
}) {
  return (
    <label className="block text-sm">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  dir,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={dir}
        required={required}
        className="mt-1 h-11 w-full rounded-sm border border-border bg-input-background px-3 outline-none focus:border-ring"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  dir,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  required?: boolean;
}) {
  return (
    <label className="block text-sm md:col-span-1">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={dir}
        required={required}
        rows={4}
        className="mt-1 w-full rounded-sm border border-border bg-input-background px-3 py-2 outline-none focus:border-ring"
      />
    </label>
  );
}
