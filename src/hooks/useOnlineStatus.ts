import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); };
};
/** navigator.onLine only reports "no network", not "server reachable". */
export const useOnlineStatus = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
