# Bonayon frontend

React 18 · TypeScript strict · Vite · Tailwind 3.4 · React Router 6 · TanStack Query 5 · Axios · RHF + Zod · Recharts · vite-plugin-pwa

## Setup
    cp .env.example .env      # leave VITE_API_URL EMPTY in dev: the Vite proxy forwards /api to VITE_PROXY_TARGET (no CORS setup)
    npm install
    npm run dev               # http://localhost:5173  (also serves /playground, dev only)
    npm run typecheck | lint | test | build | format
Set `VITE_ENABLE_PWA=true` for a production build with the app-shell service worker.
TypeScript is pinned to ~5.9: typescript-eslint supports it (needs < 6.1) and openapi-typescript requires 5.x. Do not bump to 6/7 until both support it. `npm install` needs no flags; if a lock-file ajv error ever appears, run `npm install` twice then `npm ci`.

## Backend integration (verified)
Backend: the separate `bonayon-backend` repository (FastAPI + PostgreSQL). Dev: leave VITE_API_URL empty; Vite proxies /api to VITE_PROXY_TARGET (http://localhost:8000).
`npm run gen:api` (backend running) regenerates src/types/openapi.d.ts from the live OpenAPI schema; `npm run typecheck` then compares 21
frontend types against it (src/types/contract.check.ts). Runtime check: `python -m scripts.smoke_test http://localhost:5173` (backend repo)
sent the frontend's real requests through the proxy: 32/32 passed. Not done: clicking through the UI in a real browser.

## API contract used
Base `${VITE_API_URL}/api/v1`; JWT in localStorage `bonayon_token` sent as Bearer; login is form-encoded (`username`=email, `password`);
401 clears the token and returns the user to /login?returnUrl=... ; errors read FastAPI `{detail}` / 422 arrays (src/lib/error.ts).
`src/types/api.ts` is checked against the generated OpenAPI types. Only the JSONB payloads (`Recommendation.payload/explanations`) are untyped
in OpenAPI, so they are covered by the smoke test instead of the compiler.

## Pages (all routes wired to real endpoints)
Public: / /explore /widget?district=ID /login /register /403 /404 /error · Protected: /dashboard /farms /farms/:id /farms/:id/plots/new
/climate/:id (+risk calendar) /climate/:id/anomalies /compare /crop-recommendation /season-plan (+seed estimate) /rotation /recommendations /profile
· Admin: /admin (users, crops CRUD, audit log). Route guards: ProtectedRoute (auth-loading gate), GuestRoute, AdminRoute (-> /403).

## Structure
src/app (providers, routes, guards) · src/components (ui, layout, feedback, domain) · src/features/<feature> (hooks + pages)
· src/lib (api, error, queryClient/keys, offlineCache) · src/config (navigation, permissions) · src/i18n (en/bn) · src/types/api.ts

## Modes
Dark: class on <html>, persisted, inline pre-paint script. Farmer mode: `data-farmer="on"` on <html> (Tailwind `farmer:` variant, 18px base,
56px touch targets, `.stack-grid` collapses grids to one column). Only nav/header/offline strings are translated (EN/BN); page copy is English.

## Troubleshooting "Cannot reach the server"
Backend not running, or CORS blocks http://localhost:5173. Start FastAPI on :8000 and keep VITE_API_URL empty (dev proxy), or add the origin to CORS_ORIGINS.
In dev a yellow "Developer hint" banner appears. Production builds REQUIRE VITE_API_URL. Bangla guide: docs/THESIS-GUIDE-bn.md

## Offline
Service worker precaches the app shell only. Public data (districts, climate profile) is mirrored to localStorage with its original
timestamp and re-shown offline. Private data is never persisted. Offline mutation queue: only create-farm and create-plot; an item is removed only after the server confirms it; no idempotency key (possible duplicate if a reply is lost).

## Verified vs not
Verified by running: typecheck, eslint (0 problems), 27 unit/component tests (RTL), production builds (PWA off/on), dev server, and the Vite proxy (502 with backend down, forwards when a stub is up).
NOT verified: any real API call (no backend was available), rendering in a browser, 360/414/768/1024/1440px layouts, dark and Farmer Mode
per page, screen-reader/keyboard audit, iframe embedding of /widget (needs CORS/frame headers), real Bangla translation quality.

## Responsiveness checklist (to tick while testing)
[ ] no horizontal scroll at 360px on every page  [ ] tables -> cards below lg  [ ] bottom nav < lg, sidebar >= lg  [ ] forms 1-col mobile, 2-col md+
[ ] chart legend below, table view works  [ ] 44px targets (56px Farmer)  [ ] dark mode  [ ] Farmer mode  [ ] keyboard focus rings  [ ] Bengali long labels

## Deploy
See **DEPLOYMENT.md** (GitHub → Netlify, and how to connect to the backend).
