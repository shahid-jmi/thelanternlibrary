import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/app/lib/useOnlineStatus';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden bg-destructive text-destructive-foreground transition-[max-height] duration-300 ${
        isOnline ? 'max-h-0' : 'max-h-12'
      }`}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-center text-sm">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>{t('offline.message')}</span>
      </div>
    </div>
  );
}
