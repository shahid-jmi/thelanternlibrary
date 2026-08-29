export function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  values,
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (value: string) => void;
  values: readonly string[];
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-sm border border-border bg-input-background px-3 text-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/25"
    >
      <option value="">{allLabel}</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}
