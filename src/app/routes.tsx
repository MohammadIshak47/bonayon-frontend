import { lazy, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminRoute, GuestRoute, ProtectedRoute } from './guards/guards';
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/components/feedback/StatusPage';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { LoginPage, RegisterPage } from '@/features/auth/AuthPages';

/** Route-level code splitting for named exports (keeps Recharts out of the first load). */
function page<M extends Record<string, unknown>, K extends keyof M>(load: () => Promise<M>, key: K) {
  return lazy(() => load().then((m) => ({ default: m[key] as ComponentType })));
}
const LandingPage = page(() => import('@/features/landing/LandingPage'), 'LandingPage');
const ExplorePage = page(() => import('@/features/climate/pages'), 'ExplorePage');
const ClimateProfilePage = page(() => import('@/features/climate/pages'), 'ClimateProfilePage');
const AnomalyPage = page(() => import('@/features/climate/pages'), 'AnomalyPage');
const ComparePage = page(() => import('@/features/climate/pages'), 'ComparePage');
const WidgetPage = page(() => import('@/features/widget/WidgetPage'), 'WidgetPage');
const DashboardPage = page(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage');
const FarmsPage = page(() => import('@/features/farms/pages'), 'FarmsPage');
const FarmDetailPage = page(() => import('@/features/farms/pages'), 'FarmDetailPage');
const PlotFormPage = page(() => import('@/features/farms/pages'), 'PlotFormPage');
const CropWizardPage = page(() => import('@/features/recommend/CropWizardPage'), 'CropWizardPage');
const SeasonPlanPage = page(() => import('@/features/recommend/SeasonPlanPage'), 'SeasonPlanPage');
const RotationPage = page(() => import('@/features/rotation/RotationPage'), 'RotationPage');
const HistoryPage = page(() => import('@/features/recommendations/HistoryPage'), 'HistoryPage');
const ProfilePage = page(() => import('@/features/profile/ProfilePage'), 'ProfilePage');
const AdminPage = page(() => import('@/features/admin/AdminPage'), 'AdminPage');
const PlaygroundPage = page(() => import('@/features/playground/PlaygroundPage'), 'PlaygroundPage');

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/explore', element: <ExplorePage /> },
      ...(import.meta.env.DEV ? [{ path: '/playground', element: <PlaygroundPage /> }] : []),
      { path: '/403', element: <ForbiddenPage /> },
      { path: '/error', element: <ErrorPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/widget', element: <WidgetPage /> },
  { element: <GuestRoute />, children: [{ element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }] }] },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppShell />,
      children: [
        { path: '/dashboard', element: <DashboardPage /> },
        { path: '/farms', element: <FarmsPage /> },
        { path: '/farms/:farmId', element: <FarmDetailPage /> },
        { path: '/farms/:farmId/plots/new', element: <PlotFormPage /> },
        { path: '/climate/:districtId', element: <ClimateProfilePage /> },
        { path: '/climate/:districtId/anomalies', element: <AnomalyPage /> },
        { path: '/compare', element: <ComparePage /> },
        { path: '/crop-recommendation', element: <CropWizardPage /> },
        { path: '/season-plan', element: <SeasonPlanPage /> },
        { path: '/rotation', element: <RotationPage /> },
        { path: '/recommendations', element: <HistoryPage /> },
        { path: '/profile', element: <ProfilePage /> },
        { element: <AdminRoute />, children: [{ path: '/admin', element: <AdminPage /> }] },
      ],
    }],
  },
]);
