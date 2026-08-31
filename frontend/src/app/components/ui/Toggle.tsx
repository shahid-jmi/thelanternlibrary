/**
 * Switch-style checkbox for admin forms (Active / Available / Featured, etc).
 * A real checkbox under the hood (keyboard + form semantics), styled as a
 * track + thumb via the `peer` siblings below it.
 */
export default function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer select-none items-center gap-3 text-sm">
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-border bg-input-background transition-colors peer-checked:border-ember peer-checked:bg-ember peer-focus-visible:ring-2 peer-focus-visible:ring-ember/30"
        />
        <span
          aria-hidden
          className="absolute left-0.5 h-5 w-5 rounded-full bg-card-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-ember-foreground"
        />
      </span>
      {label}
    </label>
  );
}
