import axios from 'axios';
import { config } from './config';
import { normalizeError } from './error';
import { tokenStore } from './tokenStore';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Login/register: a 401 there is a form error, not an expired session. */
    skipUnauthorizedHandler?: boolean;
  }
}

let unauthorizedHandler: (() => void) | null = null;
let handling401 = false;
export function setUnauthorizedHandler(fn: (() => void) | null): void { unauthorizedHandler = fn; }

export const api = axios.create({ baseURL: `${config.apiUrl}/api/v1`, timeout: 15_000 });

api.interceptors.request.use((req) => {
  const token = tokenStore.get();
  if (token) req.headers.set('Authorization', `Bearer ${token}`);
  return req;
});

// 401 => clear token once and let AuthProvider redirect; flag prevents parallel-request loops.
api.interceptors.response.use(
  (r) => r,
  (error: unknown) => {
    const appError = normalizeError(error);
    const skip = axios.isAxiosError(error) && error.config?.skipUnauthorizedHandler;
    if (appError.status === 401 && !skip && !handling401) {
      handling401 = true;
      tokenStore.clear();
      unauthorizedHandler?.();
      setTimeout(() => { handling401 = false; }, 1000);
    }
    return Promise.reject(appError);
  },
);
