import { Ellipsis, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Modal } from '@/components/ui/Modal';
import { FarmerModeToggle, LanguageToggle, ThemeToggle } from '@/components/ui/Toggles';
import { NAV_ITEMS } from '@/config/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const link = ({ isActive }: { isActive: boolean }) =>
  cn('flex min-h-tap items-center gap-3 rounded-control px-3 hover:bg-raised', isActive && 'bg-raised font-semibold text-primary-text');

export function AppShell() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const { can } = usePermissions();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = NAV_ITEMS.filter((n) => !n.capability || can(n.capability));
  const bottom = items.filter((n) => n.bottom);
  const rest = items.filter((n) => !n.bottom);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-subtle bg-surface p-3 lg:flex lg:flex-col">
        <div className="mb-4 px-1"><Logo /></div>
        <nav aria-label={t('navigation.primary')} className="flex flex-1 flex-col gap-1">
          {items.map(({ to, labelKey, icon: Icon }) => <NavLink key={to} to={to} className={link}><Icon size={20} aria-hidden="true" /> {t(labelKey)}</NavLink>)}
        </nav>
        <button type="button" onClick={logout} className="flex min-h-tap items-center gap-3 rounded-control px-3 text-muted hover:bg-raised"><LogOut size={20} aria-hidden="true" /> {t('navigation.logout')}</button>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 lg:pb-0">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle bg-surface px-4 py-2">
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            <LanguageToggle /><ThemeToggle /><FarmerModeToggle />
            {user && <Link to="/profile" className="flex min-h-tap items-center rounded-control px-3 font-semibold hover:bg-raised">{user.name}</Link>}
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 p-4 lg:p-6"><Outlet /></main>
      </div>

      <nav aria-label={t('navigation.primaryMobile')} className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-subtle bg-surface lg:hidden">
        {bottom.map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 text-center text-sm', isActive ? 'font-semibold text-primary-text' : 'text-muted')}>
            <Icon size={20} aria-hidden="true" /> {t(labelKey)}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMoreOpen(true)} className="flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-sm text-muted"><Ellipsis size={20} aria-hidden="true" />{t('navigation.more')}</button>
      </nav>
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title={t('navigation.more')}>
        <ul className="flex flex-col gap-1">
          {rest.map(({ to, labelKey, icon: Icon }) => <li key={to}><NavLink to={to} onClick={() => setMoreOpen(false)} className={link}><Icon size={20} aria-hidden="true" /> {t(labelKey)}</NavLink></li>)}
          <li><button type="button" onClick={logout} className="flex min-h-tap w-full items-center gap-3 rounded-control px-3 text-muted hover:bg-raised"><LogOut size={20} aria-hidden="true" /> {t('navigation.logout')}</button></li>
        </ul>
      </Modal>
    </div>
  );
}
