import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-subtle border-t-primary" aria-hidden="true" />{label}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-control bg-subtle', className)} />;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-subtle p-8 text-center">
      <Inbox size={32} className="text-muted" aria-hidden="true" />
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="max-w-prose text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-card border border-danger/50 p-8 text-center">
      <TriangleAlert size={32} className="text-danger-text" aria-hidden="true" />
      <h3 className="font-semibold">Something went wrong</h3>
      <p className="max-w-prose text-muted">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" />Try again</Button>}
    </div>
  );
}
