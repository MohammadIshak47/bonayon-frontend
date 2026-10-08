import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { normalizeError } from '@/lib/error';
import { EmptyState, ErrorState } from './States';

interface Props<T> {
  query: UseQueryResult<T, unknown>;
  skeleton: ReactNode;
  /** Return true when data should render as empty. */
  isEmpty?: (data: T) => boolean;
  empty?: { title: string; description?: string; action?: ReactNode };
  children: (data: T) => ReactNode;
}

/** One place for loading / error / empty / success. Keeps old data visible during refetch. */
export function QueryState<T>({ query, skeleton, isEmpty, empty, children }: Props<T>) {
  if (query.isPending) return <>{skeleton}</>;
  if (query.isError && query.data === undefined) {
    return <ErrorState message={normalizeError(query.error).message} onRetry={() => void query.refetch()} />;
  }
  const data = query.data as T;
  if (isEmpty?.(data)) return <EmptyState title={empty?.title ?? 'Nothing here yet'} description={empty?.description} action={empty?.action} />;
  return <div aria-busy={query.isFetching}>{children(data)}</div>;
}
