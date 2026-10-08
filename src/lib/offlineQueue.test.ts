// @vitest-environment jsdom
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api', () => ({ api: { post: vi.fn() } }));
import { api } from './api';
import { flushQueue, queue } from './offlineQueue';

const farm = { name: 'F', district_id: 'd1' };
const post = vi.mocked(api.post);
beforeEach(() => { queue.clear(); post.mockReset(); });

describe('offline queue', () => {
  it('removes an item only after the server confirms it', async () => {
    queue.enqueue({ kind: 'create_farm', payload: farm }, 'u1');
    post.mockResolvedValueOnce({ data: {} });
    const r = await flushQueue(new QueryClient(), 'u1');
    expect(r.synced).toBe(1);
    expect(queue.get()).toHaveLength(0);
  });
  it('keeps the item waiting on a network/server failure', async () => {
    queue.enqueue({ kind: 'create_farm', payload: farm }, 'u1');
    post.mockRejectedValueOnce({ message: 'down', code: 'NETWORK_ERROR' });
    await flushQueue(new QueryClient(), 'u1');
    expect(queue.get()[0]?.status).toBe('pending');
  });
  it('marks validation rejections as failed instead of retrying forever', async () => {
    queue.enqueue({ kind: 'create_farm', payload: farm }, 'u1');
    post.mockRejectedValueOnce({ message: 'Name taken', status: 422 });
    const r = await flushQueue(new QueryClient(), 'u1');
    expect(r.failed).toBe(1);
    expect(queue.get()[0]).toMatchObject({ status: 'failed', error: 'Name taken' });
  });
  it("never sends another user's changes", async () => {
    queue.enqueue({ kind: 'create_farm', payload: farm }, 'someone-else');
    await flushQueue(new QueryClient(), 'u1');
    expect(post).not.toHaveBeenCalled();
    expect(queue.get()).toHaveLength(1);
  });
});
