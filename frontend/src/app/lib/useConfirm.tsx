import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface ConfirmState {
  message: string;
  resolve: (value: boolean) => void;
}

/**
 * Themed replacement for window.confirm — same async-boolean call shape
 * (`if (!(await confirm(message))) return;`) so call sites barely change,
 * but renders as an on-brand dialog instead of the browser's native one.
 */
export function useConfirm(): { confirm: (message: string) => Promise<boolean>; dialog: ReactNode } {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (message: string) => new Promise<boolean>((resolve) => setState({ message, resolve })),
    []
  );

  const settle = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  const dialog = state ? (
    <ConfirmDialog message={state.message} onConfirm={() => settle(true)} onCancel={() => settle(false)} />
  ) : null;

  return { confirm, dialog };
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-popover p-6 text-popover-foreground">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg tracking-[0.05em]">{t('admin.confirm.title')}</h2>
        </div>
        <p className="mt-3 text-sm opacity-80">{message}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-border text-xs uppercase tracking-label text-destructive transition hover:bg-secondary"
          >
            {t('admin.confirm.delete')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm"
          >
            {t('admin.form.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
