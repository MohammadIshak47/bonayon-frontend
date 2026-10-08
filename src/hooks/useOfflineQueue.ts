import { useSyncExternalStore } from 'react';
import { queue } from '@/lib/offlineQueue';

export const useOfflineQueue = () => useSyncExternalStore(queue.subscribe, queue.get);
