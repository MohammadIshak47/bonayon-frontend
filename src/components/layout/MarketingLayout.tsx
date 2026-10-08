import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { FarmerModeToggle, ThemeToggle } from '@/components/ui/Toggles';
import { ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { LanguageToggle } from '@/components/ui/Toggles';
import { ADVISORY_DISCLAIMER } from '@/lib/constants';

export function MarketingLayout() {
  const { status } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-2">
          <Logo />
          <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
            <NavLink to="/explore" className={({ isActive }) => `flex min-h-tap items-center rounded-control px-3 hover:bg-raised ${isActive ? 'font-semibold text-primary-text' : ''}`}>
              {t('navigation.explorer')}
            </NavLink>
            <LanguageToggle />
            <ThemeToggle />
            <FarmerModeToggle />
            {status === 'authenticated' ? (
              <ButtonLink to="/dashboard">{t('navigation.dashboard')}</ButtonLink>
            ) : (
              <>
                <ButtonLink to="/login" variant="ghost">{t('navigation.login')}</ButtonLink>
                <ButtonLink to="/register">{t('navigation.register')}</ButtonLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1"><Outlet /></main>
      <footer className="border-t border-subtle bg-surface">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">{ADVISORY_DISCLAIMER}</p>
      </footer>
    </div>
  );
}
