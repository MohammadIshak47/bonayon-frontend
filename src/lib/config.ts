import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_APP_NAME: z.string().default('Bonayon'),
  VITE_DEFAULT_LANGUAGE: z.enum(['en', 'bn']).default('en'),
  VITE_ENABLE_PWA: z.enum(['true', 'false']).default('false'),
});
const parsed = schema.safeParse({ ...import.meta.env, VITE_API_URL: import.meta.env.VITE_API_URL || undefined });
const env = parsed.success ? parsed.data : schema.parse({});

/** Shown by App as a config error screen instead of calling a wrong URL. */
// Empty VITE_API_URL is allowed in dev (requests go through the Vite proxy, which avoids CORS) but not in production.
export const configError = !parsed.success
  ? `Invalid environment configuration: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`
  : import.meta.env.PROD && !env.VITE_API_URL ? 'VITE_API_URL must be set for production builds.' : null;
export const config = { apiUrl: (env.VITE_API_URL ?? '').replace(/\/+$/, ''), appName: env.VITE_APP_NAME, defaultLanguage: env.VITE_DEFAULT_LANGUAGE };
