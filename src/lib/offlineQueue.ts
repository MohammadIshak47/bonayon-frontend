import type { QueryClient } from '@tanstack/react-query';
import type { NewFarm, NewPlot } from '@/features/farms/hooks';
import { api } from './api';
import { isAppError } from './error';
import { queryKeys } from './queryKeys';
import { storage } from './storage';

/**
 * Offline mutation queue. Supported operations (deliberately only two): create farm, create plot.
 * - Stored in localStorage on this device only, tagged with the owner's user id.
 * - An item is removed ONLY after the server confirms it (2xx). Until then it is shown as "waiting".
 * - Validation-type rejections (4xx except 401/408/429) are marked "failed" for the user to fix; network errors,
 *   5xx and 401 leave the item waiting and stop the run.
 * - No idempotency key exists, so if a request reached the server but the reply was lost, a retry could create a duplicate.
 */
export type OpInput = { kind: 'create_farm'; payload: NewFarm } | { kind: 'create_plot'; farmId: string; payload: NewPlot };
export type QueuedOp = OpInput & { id: string; ownerId: string; createdAt: number; status: 'pending' | 'failed'; error?: string };

const KEY = 'bonayon:queue';
const listeners = new Set<() => void>();

function read(): QueuedOp[] {
  try {
    const v: unknown = JSON.parse(storage.get(KEY) ?? '[]');
    return Array.isArray(v) ? (v as QueuedOp[]) : [];
  } catch { return []; }
}
let ops: QueuedOp[] = read();
function commit(next: QueuedOp[]) { ops = next; storage.set(KEY, JSON.stringify(next)); listeners.forEach((l) => l()); }

export const queue = {
  get: () => ops,
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
  enqueue(input: OpInput, ownerId: string) {
    commit([...ops, { ...input, id: crypto.randomUUID(), ownerId, createdAt: Date.now(), status: 'pending' }]);
  },
  remove: (id: string) => commit(ops.filter((o) => o.id !== id)),
  markFailed: (id: string, error: string) => commit(ops.map((o) => (o.id === id ? { ...o, status: 'failed' as const, error } : o))),
  clear: () => commit([]),
};

export const describeOp = (o: QueuedOp) => (o.kind === 'create_farm' ? `Farm “${o.payload.name}”` : `Plot “${o.payload.name}”`);

let flushing = false;
export async function flushQueue(qc: QueryClient, ownerId: string): Promise<{ synced: number; failed: number }> {
  const result = { synced: 0, failed: 0 };
  if (flushing || !navigator.onLine) return result;
  flushing = true;
  try {
    for (const op of ops.filter((o) => o.status === 'pending' && o.ownerId === ownerId)) {
      try {
        if (op.kind === 'create_farm') await api.post('/farms', op.payload);
        else await api.post(`/farms/${op.farmId}/plots`, op.payload);
        queue.remove(op.id); // confirmed by the server
        result.synced += 1;
        void qc.invalidateQueries({ queryKey: ['farms'] });
        void qc.invalidateQueries({ queryKey: ['plots'] });
        void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      } catch (e) {
        const s = isAppError(e) ? e.status : undefined;
        if (s && s >= 400 && s < 500 && ![401, 408, 429].includes(s)) {
          queue.markFailed(op.id, isAppError(e) ? e.message : 'Rejected by the server');
          result.failed += 1;
          continue;
        }
        break; // offline, session expired or server trouble: keep waiting
      }
    }
  } finally { flushing = false; }
  return result;
}
