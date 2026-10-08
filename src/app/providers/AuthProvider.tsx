import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setUnauthorizedHandler } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { queue } from '@/lib/offlineQueue';
import { tokenStore } from '@/lib/tokenStore';
import type { User } from '@/types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
interface AuthState { status: AuthStatus; user: User | null; signIn: (token: string) => Promise<void>; logout: () => void }
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(() => tokenStore.get() !== null);
  // Session resolves BEFORE protected content renders (no flash of protected UI).
  const me = useQuery({
    queryKey: queryKeys.auth.me, enabled: hasToken, retry: false, staleTime: Infinity,
    queryFn: async () => (await api.get<User>('/auth/me')).data,
  });

  // Session ended (expired or explicit). Queued offline changes stay, tagged with their owner id.
  const endSession = useCallback(() => {
    tokenStore.clear();
    setHasToken(false);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'districts' && !(q.queryKey[0] === 'climate' && q.queryKey.length === 2) });
  }, [qc]);
  // Explicit logout also discards changes saved on this device.
  const logout = useCallback(() => { queue.clear(); endSession(); }, [endSession]);

  const signIn = useCallback(async (token: string) => {
    tokenStore.set(token);
    setHasToken(true);
    await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
  }, [qc]);

  useEffect(() => { setUnauthorizedHandler(endSession); return () => setUnauthorizedHandler(null); }, [endSession]);

  const status: AuthStatus = !hasToken ? 'unauthenticated' : me.isPending ? 'loading' : me.data ? 'authenticated' : 'unauthenticated';
  const value = useMemo(() => ({ status, user: me.data ?? null, signIn, logout }), [status, me.data, signIn, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
