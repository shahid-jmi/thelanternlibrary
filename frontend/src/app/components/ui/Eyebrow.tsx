import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type EyebrowTracking = 'tight' | 'label' | 'wide' | 'wider' | 'widest' | 'loose';

const trackingClass: Record<EyebrowTracking, string> = {
  tight: 'tracking-tight',
  label: 'tracking-label',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
  loose: 'tracking-loose',
};

/**
 * The small italic/uppercase section label used throughout the marketing
 * page — e.g. "i.", "· A Curated Catalog ·". Consolidates what used to be
 * a hand-written `text-xs italic tracking-[0.2em] text-accent` className
 * repeated on nearly every HomePage section.
 */
export default function Eyebrow({
  tracking = 'wide',
  italic = true,
  uppercase = false,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tracking?: EyebrowTracking;
  italic?: boolean;
  uppercase?: boolean;
}) {
  return (
    <p
      className={cn(
        'text-xs text-accent',
        trackingClass[tracking],
        italic && 'italic',
        uppercase && 'uppercase',
        className,
      )}
      {...props}
    />
  );
}
