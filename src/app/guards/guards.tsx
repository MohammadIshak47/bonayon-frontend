import type { Capability } from '@/config/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader';

/** Resolves auth before rendering anything, so protected content never flashes. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'unauthenticated') {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** UX guard only: the backend must enforce admin access on every request. */
export function AdminRoute({ capability = 'users:manage' }: { capability?: Capability }) {
  const { can } = usePermissions();
  return can(capability) ? <Outlet /> : <Navigate to="/403" replace />;
}
