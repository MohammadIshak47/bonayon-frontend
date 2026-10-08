import { Languages, Monitor, Moon, Sun, Type } from 'lucide-react';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { LANGUAGES } from '@/i18n/types';
import { usePreferences, type ThemeSetting } from '@/app/providers/PreferencesProvider';
import { cn } from '@/lib/utils';

const ORDER: ThemeSetting[] = ['light', 'dark', 'system'];
const ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const btn = 'inline-flex min-h-tap min-w-tap items-center justify-center gap-2 rounded-control px-3 text-sm hover:bg-raised';

export function ThemeToggle() {
  const { theme, setTheme } = usePreferences();
  const Icon = ICON[theme];
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] as ThemeSetting;
  return (
    <button type="button" className={btn} onClick={() => setTheme(next)} aria-label={`Theme: ${theme}. Switch to ${next}.`}>
      <Icon size={20} aria-hidden="true" />
      <span className="hidden capitalize sm:inline">{theme}</span>
    </button>
  );
}

export function FarmerModeToggle() {
  const { farmerMode, setFarmerMode } = usePreferences();
  const { t } = useLanguage();
  return (
    <button
      type="button"
      className={cn(btn, farmerMode && 'bg-primary text-on-primary hover:bg-primary')}
      aria-pressed={farmerMode}
      onClick={() => setFarmerMode(!farmerMode)}
    >
      <Type size={20} aria-hidden="true" />
      <span>{t('common.farmerMode')}</span>
    </button>
  );
}


export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const other = LANGUAGES.find((l) => l.code !== language);
  if (!other) return null;
  return (
    <button type="button" className={btn} lang={other.code} onClick={() => setLanguage(other.code)} aria-label={`${t('common.language')}: ${other.label}`}>
      <Languages size={20} aria-hidden="true" /><span>{other.label}</span>
    </button>
  );
}
