import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [
      react(),
      VitePWA({
        disable: env.VITE_ENABLE_PWA !== 'true',
        registerType: 'prompt',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Bonayon',
          short_name: 'Bonayon',
          description: 'Climate-smart crop planning and risk advisory',
          start_url: '/',
          display: 'standalone',
          theme_color: '#2E7D32',
          background_color: '#F7F8F5',
          // Placeholder solid-colour icons: replace with real artwork before release.
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        // App shell only. runtimeCaching is empty on purpose: no API response is cached until the
        // approved-cache list (TODO) exists, so private farm data is never stored by the service worker.
        workbox: { navigateFallback: '/index.html', runtimeCaching: [], cleanupOutdatedCaches: true },
      }),
    ],
    // Dev only: forward /api to the backend so the browser sees one origin (no CORS setup needed).
    server: { proxy: { '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true } } },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    test: { environment: 'node', include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['src/test-setup.ts'] },
  };
});
