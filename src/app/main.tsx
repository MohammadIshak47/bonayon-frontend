import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import { App } from './App';

createRoot(document.getElementById('root') as HTMLElement).render(<StrictMode><App /></StrictMode>);

// App-shell PWA only (see vite.config.ts). TODO: add an "update available" prompt UI.
if (import.meta.env.VITE_ENABLE_PWA === 'true') {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}
