import type { ReactNode } from 'react';

export default function StatusMessage({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div
      className={`mb-6 rounded-sm border border-border bg-card p-4 text-sm ${
        tone === 'error' ? 'text-destructive' : 'opacity-75'
      }`}
    >
      {children}
    </div>
  );
}
