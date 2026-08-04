import { useTranslation } from 'react-i18next';
import type { FieldErrorKey } from '../lib/validation';

export default function ValidatedTextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: FieldErrorKey;
  autoComplete?: string;
}) {
  const { t } = useTranslation();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`h-11 w-full rounded-sm border bg-input-background px-3 outline-none transition-colors ${
          error ? 'border-destructive' : 'border-border focus:border-ember'
        }`}
      />
      <p
        id={errorId}
        className={`mt-1.5 text-xs text-destructive transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}
      >
        {error ? t(error) : ' '}
      </p>
    </div>
  );
}
