import type { ReactNode } from 'react';

const fieldClass = (hasError: boolean) =>
  `w-full rounded-sm border bg-input-background px-3 outline-none transition-colors ${
    hasError ? 'border-destructive' : 'border-border focus:border-ember'
  }`;

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs italic opacity-60">{hint}</p>}
      <p
        id={`${id}-error`}
        className={`mt-1.5 text-xs text-destructive transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}
      >
        {error || ' '}
      </p>
    </div>
  );
}

export function FieldInput({
  id,
  label,
  hint,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  dir,
  autoComplete,
  min,
  step,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  dir?: 'ltr' | 'rtl';
  autoComplete?: string;
  min?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        dir={dir}
        autoComplete={autoComplete}
        min={min}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        className={`h-11 ${fieldClass(Boolean(error))}`}
      />
    </FieldShell>
  );
}

export function FieldTextArea({
  id,
  label,
  hint,
  value,
  onChange,
  onBlur,
  error,
  dir,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        dir={dir}
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        className={`py-2 ${fieldClass(Boolean(error))}`}
      />
    </FieldShell>
  );
}

export function FieldSelect({
  id,
  label,
  value,
  onChange,
  error,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        className={`h-11 ${fieldClass(Boolean(error))}`}
      >
        {children}
      </select>
    </FieldShell>
  );
}
