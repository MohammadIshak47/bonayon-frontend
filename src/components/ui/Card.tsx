import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-subtle bg-surface p-4 shadow-card', className)} {...rest} />;
}

interface StatCardProps { label: string; value: ReactNode; hint?: string; icon?: ReactNode }
/** Presentational only: callers pass values that came from the backend. */
export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between text-muted"><span>{label}</span>{icon}</div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </Card>
  );
}
