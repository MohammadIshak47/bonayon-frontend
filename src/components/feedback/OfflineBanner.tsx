import { CloudUpload, WifiOff } from 'lucide-react';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();
  const waiting = useOfflineQueue().filter((o) => o.status === 'pending').length;
  const { t } = useLanguage();
  if (online && waiting === 0) return null;
  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber px-4 py-1 text-center text-sm font-semibold text-black">
      {!online && <span className="flex items-center gap-2"><WifiOff size={16} aria-hidden="true" />{t('common.offline')}</span>}
      {waiting > 0 && <span className="flex items-center gap-2"><CloudUpload size={16} aria-hidden="true" />{waiting} change{waiting > 1 ? 's' : ''} waiting to sync</span>}
    </div>
  );
}
