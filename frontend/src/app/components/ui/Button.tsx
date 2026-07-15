import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

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
}

/**
 * Shared button. Covers the primary/outline/destructive/ghost buttons that
 * were previously duplicated as raw className strings across the admin
 * panels and public pages. Extend `variants`/`sizes` here rather than
 * writing a new one-off className at the call site.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export default Button;
