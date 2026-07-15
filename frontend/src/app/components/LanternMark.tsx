export default function LanternMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="7" r="3.5" />
      <path d="M32 10.5V16" />
      <path d="M20 27 32 16l12 11" />
      <path d="M21 27h22" />
      <rect x="23" y="27" width="18" height="34" rx="1.5" />
      <path d="M32 27v34" />
      <path d="M23 44h18" />
      <path
        d="M32 34c3 3.5 3 7 0 9.5-3-2.5-3-6 0-9.5z"
        className="text-accent"
        fill="currentColor"
        stroke="none"
      />
      <path d="M20 61h24" />
      <path d="M25 61l-2.5 7h19L39 61" />
      <path d="M32 68v6" />
    </svg>
  );
}
