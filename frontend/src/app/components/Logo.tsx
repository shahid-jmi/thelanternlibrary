import logoFull from '@/assets/logo-full.webp';

// The image is used as a mask so the logo takes the theme's foreground colour
// (brown in light mode, cream in dark mode) instead of its baked-in ink.
const maskImage = `url(${logoFull})`;

export function Logo({
  variant = 'inline',
  className = '',
}: {
  variant?: 'inline' | 'mark';
  className?: string;
}) {
  const isMark = variant === 'mark';

  return (
    <span
      role="img"
      aria-label="The Lantern Library"
      style={{ maskImage, WebkitMaskImage: maskImage }}
      className={`block aspect-[559/360] shrink-0 bg-foreground mask-contain mask-left mask-no-repeat ${isMark ? 'h-24 sm:h-28' : 'h-12 sm:h-14 lg:h-16'} ${className}`.trim()}
    />
  );
}
