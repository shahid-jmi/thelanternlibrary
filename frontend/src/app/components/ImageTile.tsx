import type { ReactNode } from 'react';

/**
 * Shared image surface: real photos get the duotone treatment plus a warm
 * multiply overlay so every asset reads as one photoshoot; without a src it
 * renders a deep warm-brown tile with line-art, never a broken image.
 */
export default function ImageTile({
  src,
  alt = '',
  className = '',
  placeholder,
  overlay,
}: {
  src?: string;
  alt?: string;
  className?: string;
  placeholder?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div
      className={`group/tile relative overflow-hidden rounded-sm border border-border ${className}`}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            className="brand-photo h-full w-full object-cover transition duration-[400ms] ease-out group-hover/tile:scale-[1.02]"
          />
          <div
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              background:
                'linear-gradient(160deg, rgba(139, 105, 20, 0.16), rgba(60, 35, 10, 0.2))',
            }}
          />
        </>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center p-6 transition duration-[400ms] ease-out group-hover/tile:scale-[1.02]"
          style={{
            background:
              'radial-gradient(circle at 32% 24%, rgba(200, 150, 60, 0.3) 0%, transparent 60%), linear-gradient(165deg, #4a3520 0%, #332414 55%, #241708 100%)',
          }}
        >
          {placeholder}
        </div>
      )}
      {overlay}
    </div>
  );
}
