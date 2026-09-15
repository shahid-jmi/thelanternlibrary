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
      className={`flex items-center ${isMark ? 'gap-3' : 'gap-2 sm:gap-3'} ${isMark ? '' : 'min-w-0 overflow-hidden'} ${className}`.trim()}
    >
      <img
        src={logo}
        alt="The Lantern Library logo"
        className={`${isMark ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-10 w-10 sm:h-14 sm:w-14'} shrink-0 object-contain`}
      />
      <div
        className={`text-center leading-none ${isMark ? '' : 'hidden min-[340px]:block shrink-0'}`}
      >
        <p
          className={
            isMark
              ? 'text-xs uppercase tracking-[0.4em] opacity-70'
              : 'text-[8px] font-semibold uppercase tracking-[0.15em] opacity-80 sm:text-[10px] sm:tracking-[0.25em]'
          }
        >
          The
        </p>
        <p
          className={
            isMark
              ? 'mt-1 text-2xl uppercase tracking-[0.08em] sm:text-3xl'
              : '-mt-1 text-xs uppercase tracking-[0.04em] sm:text-sm sm:tracking-[0.08em]'
          }
        >
          Lantern
        </p>
        <p
          className={
            isMark
              ? 'mt-1 text-2xl uppercase tracking-[0.08em] sm:text-3xl'
              : '-mt-1 text-xs uppercase tracking-[0.04em] sm:text-sm sm:tracking-[0.08em]'
          }
        >
          Library
        </p>
      </div>
    </div>
  );
}
