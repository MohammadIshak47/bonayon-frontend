import { Clock } from 'lucide-react';
import { ADVISORY_DISCLAIMER } from '@/lib/constants';

export function FreshnessNote({ at, stale, source }: { at?: string | number | null; stale?: boolean; source?: string }) {
  if (!at) return null;
  const synthetic = source?.startsWith('MOCK');
  return (
    <p className="flex flex-wrap items-center gap-1 text-sm text-muted">
      <Clock size={14} aria-hidden="true" />
      Data updated {new Date(at).toLocaleString()}{source ? ` · Source: ${source}` : ''}{stale ? ' · may be out of date (live source unavailable)' : ''}
      {synthetic && <strong className="text-amber-text"> · Synthetic development data, not real climate.</strong>}
    </p>
  );
}

export function Disclaimer({ text = ADVISORY_DISCLAIMER }: { text?: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}
