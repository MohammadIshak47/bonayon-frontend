import { Clock, TriangleAlert } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { describeOp, queue } from '@/lib/offlineQueue';

/** Shows changes saved on this device that the server has not confirmed yet. */
export function PendingChanges() {
  const { user } = useAuth();
  const ops = useOfflineQueue().filter((o) => o.ownerId === user?.id);
  if (ops.length === 0) return null;
  return (
    <Card className="space-y-2" aria-label="Changes waiting to sync">
      <h2 className="font-semibold">Waiting to sync</h2>
      <ul className="space-y-2">{ops.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">{o.status === 'failed' ? <TriangleAlert size={16} className="text-danger-text" aria-hidden="true" /> : <Clock size={16} aria-hidden="true" />}
            {describeOp(o)} — {o.status === 'failed' ? `not accepted: ${o.error ?? 'rejected'}` : 'saved on this device, not yet on the server'}</span>
          <Button variant="ghost" onClick={() => queue.remove(o.id)}>Discard</Button>
        </li>))}</ul>
    </Card>
  );
}
