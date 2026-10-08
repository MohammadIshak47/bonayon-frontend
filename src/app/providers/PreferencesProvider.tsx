import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';

export type ThemeSetting = 'light' | 'dark' | 'system';

interface Preferences {
  theme: ThemeSetting;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: ThemeSetting) => void;
  farmerMode: boolean;
  setFarmerMode: (on: boolean) => void;
}

const THEME_KEY = 'bonayon:theme';
const FARMER_KEY = 'bonayon:farmer';
const Ctx = createContext<Preferences | null>(null);

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function readTheme(): ThemeSetting {
  const v = storage.get(THEME_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting>(readTheme);
  const [farmerMode, setFarmerState] = useState(() => storage.get(FARMER_KEY) === 'on');
  const [prefersDark, setPrefersDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setPrefersDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (farmerMode) root.setAttribute('data-farmer', 'on');
    else root.removeAttribute('data-farmer');
  }, [farmerMode]);

  const setTheme = useCallback((t: ThemeSetting) => { setThemeState(t); storage.set(THEME_KEY, t); }, []);
  const setFarmerMode = useCallback((on: boolean) => { setFarmerState(on); storage.set(FARMER_KEY, on ? 'on' : 'off'); }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, farmerMode, setFarmerMode }),
    [theme, resolvedTheme, setTheme, farmerMode, setFarmerMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences(): Preferences {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePreferences must be used inside PreferencesProvider');
  return v;
}
