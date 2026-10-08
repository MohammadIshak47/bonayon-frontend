import { useMemo } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { capabilitiesFor, type Capability } from '@/config/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const caps = useMemo(() => capabilitiesFor(user), [user]);
  return { can: (c: Capability) => caps.has(c) };
}
