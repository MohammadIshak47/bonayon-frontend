import axios from 'axios';

export interface AppError {
  /** Safe, user-facing text. */
  message: string;
  status?: number;
  code?: string;
  /** For logs/dev only. Never render this. */
  details?: unknown;
  /** For React Hook Form setError. */
  fieldErrors?: Record<string, string>;
}

export function isAppError(e: unknown): e is AppError {
  return typeof e === 'object' && e !== null && 'message' in e && typeof (e as AppError).message === 'string' && !(e instanceof Error);
}

const GENERIC = 'Something went wrong on our side. Please try again in a moment.';

/**
 * ASSUMPTION (verify in Phase 0): errors follow FastAPI's default shape,
 * `{ detail: string | Array<{ loc: (string|number)[]; msg: string }> }`.
 */
export function normalizeError(err: unknown): AppError {
  if (isAppError(err)) return err;

  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return err.code === 'ECONNABORTED'
        ? { message: 'The request took too long. Please try again.', code: 'TIMEOUT' }
        : { message: 'Cannot reach the server. Check your connection and try again.', code: 'NETWORK_ERROR' };
    }
    const { status, data } = err.response as { status: number; data: unknown };
    const detail = (data as { detail?: unknown } | null)?.detail;

    if (status === 401) return { message: 'Please sign in to continue.', status, code: 'UNAUTHORIZED' };
    if (status === 403) return { message: 'You do not have permission to do that.', status, code: 'FORBIDDEN' };
    if (status === 404) return { message: 'We could not find what you asked for.', status, code: 'NOT_FOUND' };

    if (status === 422 && Array.isArray(detail)) {
      const fieldErrors: Record<string, string> = {};
      for (const item of detail as Array<{ loc?: unknown[]; msg?: string }>) {
        const key = String(item.loc?.[item.loc.length - 1] ?? 'form');
        fieldErrors[key] ??= item.msg ?? 'Invalid value';
      }
      return { message: 'Please check the highlighted fields.', status, code: 'VALIDATION', fieldErrors, details: detail };
    }
    if (status >= 400 && status < 500 && typeof detail === 'string' && detail.length <= 200) {
      return { message: detail, status, code: 'CLIENT_ERROR' };
    }
    // The engines answer 503 "INSUFFICIENT_DATA: ..." when climate data is unavailable: show that reason, not a generic outage.
    if (status === 503 && typeof detail === 'string' && detail.startsWith('INSUFFICIENT_DATA')) {
      return { message: detail.replace(/^INSUFFICIENT_DATA:\s*/, 'Not enough climate data: '), status, code: 'INSUFFICIENT_DATA' };
    }
    // Bad gateway/unavailable, or an empty 5xx body (what the Vite dev proxy returns when the backend is down).
    if (status === 502 || status === 503 || status === 504 || (status >= 500 && (data === '' || data == null))) {
      return { message: 'Cannot reach the server. Check that the backend is running and try again.', status, code: 'SERVER_UNREACHABLE' };
    }
    if (status >= 500) return { message: GENERIC, status, code: 'SERVER_ERROR', details: data };
    return { message: 'The request could not be completed.', status, code: 'CLIENT_ERROR', details: data };
  }

  return { message: GENERIC, code: 'UNKNOWN', details: err };
}
