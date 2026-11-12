import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/cn';

export type ButtonVariant = 'primary' | 'outline' | 'destructive-outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm transition disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground',
  outline: 'border border-border hover:bg-secondary',
  'destructive-outline': 'border border-border text-destructive hover:bg-secondary',
  ghost: 'hover:bg-secondary',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner before the label and disables the button. */
  loading?: boolean;
}

/**
 * Shared button. Covers the primary/outline/destructive/ghost buttons that
 * were previously duplicated as raw className strings across the admin
 * panels and public pages. Extend `variants`/`sizes` here rather than
 * writing a new one-off className at the call site.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
