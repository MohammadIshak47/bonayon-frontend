import { describe, expect, it } from 'vitest';
import type { User } from '@/types/api';
import { capabilitiesFor } from './permissions';

const u = (role: User['role']): User => ({ id: '1', name: 'A', email: 'a@x.io', phone: null, role, is_active: true, created_at: '' });
describe('capabilitiesFor', () => {
  it('signed out: nothing', () => expect(capabilitiesFor(null).size).toBe(0));
  it('farmer cannot manage users', () => expect(capabilitiesFor(u('farmer')).has('users:manage')).toBe(false));
  it('admin can', () => expect(capabilitiesFor(u('admin')).has('users:manage')).toBe(true));
});
