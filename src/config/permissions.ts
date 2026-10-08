import type { User } from '@/types/api';

export type Capability =
  | 'dashboard:view' | 'farms:manage' | 'plots:manage' | 'climate:view' | 'recommendations:generate'
  | 'crops:manage' | 'users:manage' | 'audit:view';

const MEMBER: Capability[] = ['dashboard:view', 'farms:manage', 'plots:manage', 'climate:view', 'recommendations:generate'];
const ADMIN: Capability[] = [...MEMBER, 'crops:manage', 'users:manage', 'audit:view'];

/** Roles per the API contract: farmer | admin. UX only: the backend enforces every operation. */
export function capabilitiesFor(user: User | null): ReadonlySet<Capability> {
  if (!user) return new Set();
  return new Set(user.role === 'admin' ? ADMIN : MEMBER);
}
