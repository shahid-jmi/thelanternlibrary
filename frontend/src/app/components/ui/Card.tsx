import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/**
 * The bordered/rounded surface used for panels, forms, and table wrappers
 * throughout the admin UI (`rounded-sm border border-border bg-card`).
 * Previously repeated verbatim in every admin panel file.
 */
export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-sm border border-border bg-card', className)} {...props} />;
}
