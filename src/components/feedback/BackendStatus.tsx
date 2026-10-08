import { useDistricts } from '@/features/climate/hooks';
import { config } from '@/lib/config';
import { isAppError } from '@/lib/error';

function DevBackendHint() {
  const q = useDistricts();
  const code = isAppError(q.error) ? q.error.code : undefined;
  if (code !== 'NETWORK_ERROR' && code !== 'SERVER_UNREACHABLE') return null;
  return (
    <div role="alert" className="border-b border-amber bg-amber/20 px-4 py-2 text-sm text-amber-text">
      <strong>Developer hint:</strong> the backend at {config.apiUrl || 'the Vite proxy target (VITE_PROXY_TARGET)'} did not answer.
      (1) Start FastAPI, e.g. <code>uvicorn app.main:app --reload --port 8000</code>. (2) If it is running and you set VITE_API_URL,
      add <code>http://localhost:5173</code> to the backend CORS_ORIGINS, or leave VITE_API_URL empty to use the dev proxy.
    </div>
  );
}

/** Development only: production builds never render or call anything here. */
export const BackendStatus = import.meta.env.DEV ? DevBackendHint : () => null;
