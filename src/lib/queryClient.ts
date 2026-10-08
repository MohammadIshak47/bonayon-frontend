import { QueryClient } from '@tanstack/react-query';
import { initOfflineCache } from './offlineCache';
import { isAppError } from './error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount: number, error: unknown) => {
        if (isAppError(error) && error.status && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

initOfflineCache(queryClient);
