type ClassValue = string | number | false | null | undefined;

/**
 * Joins conditional className fragments, dropping falsy values.
 * Lightweight stand-in for clsx — no dependency, no Tailwind conflict
 * resolution. If class *conflicts* start showing up (e.g. two different
 * `px-*` utilities landing on the same element), reach for `tailwind-merge`
 * instead of hand-rolling precedence rules here.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
