import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeError } from './error';
import { safeNextPath } from './utils';

function axiosErr(status: number, data: unknown): AxiosError {
  const e = new AxiosError('x');
  e.response = { status, data, statusText: '', headers: {}, config: {} as never };
  return e;
}

describe('normalizeError', () => {
  it('maps a missing response to NETWORK_ERROR', () => {
    expect(normalizeError(new AxiosError('down')).code).toBe('NETWORK_ERROR');
  });
  it('maps FastAPI 422 details to fieldErrors', () => {
    const r = normalizeError(axiosErr(422, { detail: [{ loc: ['body', 'email'], msg: 'invalid email' }] }));
    expect(r.code).toBe('VALIDATION');
    expect(r.fieldErrors).toEqual({ email: 'invalid email' });
  });
  it('treats an empty 500 (dev proxy, backend down) as unreachable', () => {
    expect(normalizeError(axiosErr(500, '')).code).toBe('SERVER_UNREACHABLE');
    expect(normalizeError(axiosErr(503, 'x')).code).toBe('SERVER_UNREACHABLE');
  });
  it('shows the reason for a 503 INSUFFICIENT_DATA instead of an outage message', () => {
    const r = normalizeError(axiosErr(503, { detail: 'INSUFFICIENT_DATA: not enough climate data for Dhaka right now.' }));
    expect(r.code).toBe('INSUFFICIENT_DATA');
    expect(r.message).toContain('not enough climate data for Dhaka');
  });
  it('never exposes raw 5xx text', () => {
    const r = normalizeError(axiosErr(500, { detail: 'Traceback: secret' }));
    expect(r.message).not.toContain('Traceback');
  });
});

describe('safeNextPath', () => {
  it('accepts relative paths', () => expect(safeNextPath('/farms/1')).toBe('/farms/1'));
  it('rejects open-redirect attempts', () => {
    for (const bad of ['//evil.com', 'https://evil.com', '/\\evil.com', '', null]) {
      expect(safeNextPath(bad)).toBe('/dashboard');
    }
  });
});
