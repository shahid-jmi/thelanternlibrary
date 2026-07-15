export function BotanicalCorner({
  className = '',
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${flip ? '-scale-x-100' : ''} ${className}`}
      aria-hidden="true"
    >
      <path d="M8 116C26 92 40 66 46 34" />
      <path d="M14 104q-12-4-16-16 13 1 16 16z" />
      <path d="M22 88q14-2 20-14-15-3-20 14z" />
      <path d="M30 72q-13-3-17-15 13 0 17 15z" />
      <path d="M37 56q13-1 18-13-14-3-18 13z" />
      <path d="M43 40q-11-3-14-14 12 0 14 14z" />
      <circle cx="47" cy="26" r="2.5" />
      <circle cx="52" cy="17" r="2" />
    </svg>
  );
}
