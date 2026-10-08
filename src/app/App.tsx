import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ConfigErrorScreen } from '@/components/feedback/ConfigErrorScreen';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { BackendStatus } from '@/components/feedback/BackendStatus';
import { QueueSync } from '@/components/feedback/QueueSync';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { configError } from '@/lib/config';
import { queryClient } from '@/lib/queryClient';
import { Suspense } from 'react';
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader';
import { ToastProvider } from './providers/ToastProvider';
import { AuthProvider } from './providers/AuthProvider';
import { LanguageProvider, useLanguage } from './providers/LanguageProvider';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { router } from './routes';

function SkipLink() {
  const { t } = useLanguage();
  return <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">{t('common.skipToContent')}</a>;
}

export function App() {
  if (configError) return <ConfigErrorScreen message={configError} />;
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ToastProvider>
              <OfflineBanner />
              <BackendStatus />
              <QueueSync />
              <SkipLink />
              <Suspense fallback={<FullScreenLoader />}><RouterProvider router={router} /></Suspense>
            </ToastProvider>
            </AuthProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}
