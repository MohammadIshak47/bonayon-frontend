import type { QueryClient } from '@tanstack/react-query';

/**
 * Offline re-view for PUBLIC data only (districts, climate profiles). Private farm data is never
 * written to localStorage. Restored entries keep their original timestamp so freshness stays honest.
 */
const PREFIX = 'bonayon:qc:';
const isPublicKey = (k: readonly unknown[]) => k[0] === 'districts' || (k[0] === 'climate' && k.length === 2);

export function initOfflineCache(qc: QueryClient): void {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      if (!name?.startsWith(PREFIX)) continue;
      const entry = JSON.parse(localStorage.getItem(name) ?? 'null') as { key: unknown[]; data: unknown; at: number } | null;
      if (entry && isPublicKey(entry.key)) qc.setQueryData(entry.key, entry.data, { updatedAt: entry.at });
    }
  } catch { /* corrupted cache: ignore */ }
  qc.getQueryCache().subscribe((e) => {
    if (e.type !== 'updated' || e.action.type !== 'success' || !isPublicKey(e.query.queryKey)) return;
    try {
      localStorage.setItem(PREFIX + JSON.stringify(e.query.queryKey), JSON.stringify({ key: e.query.queryKey, data: e.query.state.data, at: e.query.state.dataUpdatedAt }));
    } catch { /* quota */ }
  });
}
