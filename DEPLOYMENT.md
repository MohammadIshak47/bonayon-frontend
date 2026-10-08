# Frontend deployment (GitHub → Netlify)

This repository is the **frontend only**. The API is a separate repository (`bonayon-backend`) on Render + Neon.
Deploy the backend first: you need its Render URL (e.g. `https://bonayon-api.onrender.com`).

## 1. Push to GitHub
Create an EMPTY repository named `bonayon-frontend` (no README/.gitignore/license), then in this folder:
```
git init
git add .
git status        # must NOT list node_modules, dist or a .env file (.env.example is fine)
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bonayon-frontend.git
git push -u origin main
```

## 2. Netlify
1. app.netlify.com → Add new site → Import an existing project → GitHub → `bonayon-frontend`.
2. `netlify.toml` supplies: build command `npm run build`, publish directory `dist`, Node 22, SPA redirect. Leave the base directory empty.
3. BEFORE deploying, add an environment variable (Site configuration → Environment variables):

| Key | Value |
|---|---|
| `VITE_API_URL` | your Render URL, e.g. `https://bonayon-api.onrender.com` (no trailing slash, no `/api/v1`) |

4. Deploy (1–2 minutes). Optionally rename the site (Site configuration → Change site name), e.g. `bonayon.netlify.app`; do this before the CORS step.
5. `VITE_API_URL` is compiled in at build time. After changing it, use Deploys → Trigger deploy → **Clear cache and deploy site**.

## 3. Allow the site in the backend (CORS)
Render → `bonayon-api` → Environment → set `CORS_ORIGINS` to your exact Netlify origin (e.g. `https://bonayon.netlify.app`; scheme + host only). Save; Render redeploys.

## 4. Test
Open the Netlify URL → `/login` with your admin account → dashboard loads → districts list (64) → create a farm → crop recommendation → `/admin`. Refresh on `/dashboard`: it must not 404.

## Updating
`git add . && git commit -m "change" && git push`: Netlify rebuilds automatically.

## Troubleshooting
| Problem | Fix |
|---|---|
| "blocked by CORS policy" | Fix `CORS_ORIGINS` on Render (exact Netlify URL). |
| "VITE_API_URL must be set" | Variable missing at build time: add it, Clear cache and deploy. |
| "Cannot reach the server" | Render is asleep (wait ~1 min, retry) or `VITE_API_URL` is wrong. |
| Build fails on Netlify | Open the deploy log. Check Node is 22 (set in `netlify.toml`) and that `package-lock.json` was committed. |
| 404 on refresh | `netlify.toml` missing from repo root, or a base directory was set in the Netlify UI. |
