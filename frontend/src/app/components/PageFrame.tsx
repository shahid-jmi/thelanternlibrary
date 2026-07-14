import type { ReactNode } from 'react';

export default function PageFrame({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <main className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? 'py-16' : 'py-10'}`}>
      {children}
    </main>
  );
}
