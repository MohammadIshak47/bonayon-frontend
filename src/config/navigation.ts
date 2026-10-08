import { ArrowLeftRight, CalendarDays, CloudSun, History, LayoutDashboard, Repeat, ShieldCheck, Sprout, User, Wheat, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/config';
import type { Capability } from './permissions';

export interface NavItem { to: string; labelKey: TranslationKey; icon: LucideIcon; capability?: Capability; bottom?: boolean }

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'navigation.dashboard', icon: LayoutDashboard, capability: 'dashboard:view', bottom: true },
  { to: '/farms', labelKey: 'navigation.farms', icon: Sprout, capability: 'farms:manage', bottom: true },
  { to: '/crop-recommendation', labelKey: 'navigation.crops', icon: Wheat, capability: 'recommendations:generate', bottom: true },
  { to: '/season-plan', labelKey: 'navigation.seasonPlan', icon: CalendarDays, capability: 'recommendations:generate', bottom: true },
  { to: '/explore', labelKey: 'navigation.climate', icon: CloudSun },
  { to: '/compare', labelKey: 'navigation.compare', icon: ArrowLeftRight, capability: 'climate:view' },
  { to: '/rotation', labelKey: 'navigation.rotation', icon: Repeat, capability: 'recommendations:generate' },
  { to: '/recommendations', labelKey: 'navigation.history', icon: History, capability: 'recommendations:generate' },
  { to: '/profile', labelKey: 'navigation.profile', icon: User, capability: 'dashboard:view' },
  { to: '/admin', labelKey: 'navigation.admin', icon: ShieldCheck, capability: 'users:manage' },
];
