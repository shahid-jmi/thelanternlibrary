import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/**
 * Status pill used for active/inactive, in-stock/out-of-stock, etc. Pass
 * `active={false}` to dim it — matches the pattern already used for
 * category/product/admin status columns.
 */
export default function Badge({
  active = true,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-sm border border-border px-3 py-1.5 text-sm',
        !active && 'opacity-55',
        className,
      )}
      {...props}
    />
  );
}
