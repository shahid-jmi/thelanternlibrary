import logo from '@/assets/logo.png';

export function Logo({
  variant = 'inline',
  className = '',
}: {
  variant?: 'inline' | 'mark';
  className?: string;
}) {
  const isMark = variant === 'mark';

  return (
    <div
      className={`flex items-center gap-3 ${isMark ? '' : 'min-w-0'} ${className}`.trim()}
    >
      <img
        src={logo}
        alt="The Lantern Library logo"
        className={`${isMark ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-11 w-11'} shrink-0 object-contain`}
      />
      <div className={`text-center leading-none ${isMark ? '' : 'shrink-0'}`}>
        <p
          className={
            isMark
              ? 'text-xs uppercase tracking-[0.4em] opacity-70'
              : 'text-[9px] uppercase tracking-[0.3em] opacity-70'
          }
        >
          The
        </p>
        <p
          className={
            isMark
              ? 'mt-1 text-2xl uppercase tracking-[0.08em] sm:text-3xl'
              : 'mt-0.5 text-sm uppercase tracking-[0.08em]'
          }
        >
          Lantern
        </p>
        <p
          className={
            isMark
              ? 'mt-1 text-2xl uppercase tracking-[0.08em] sm:text-3xl'
              : 'mt-0.5 text-sm uppercase tracking-[0.08em]'
          }
        >
          Library
        </p>
      </div>
    </div>
  );
}
