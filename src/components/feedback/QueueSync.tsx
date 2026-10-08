import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { flushQueue } from '@/lib/offlineQueue';

/** Sends waiting changes when the device is online and the user is signed in. */
export function QueueSync() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const online = useOnlineStatus();
  useEffect(() => {
    if (!online || !user) return;
    void flushQueue(qc, user.id).then((r) => {
      if (r.synced) toast.success(`${r.synced} saved change${r.synced > 1 ? 's' : ''} sent to the server`);
      if (r.failed) toast.error(`${r.failed} saved change${r.failed > 1 ? 's were' : ' was'} rejected. Please review them.`);
    });
  }, [online, user, qc, toast]);
  return null;
}
