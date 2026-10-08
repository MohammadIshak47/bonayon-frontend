import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { config } from '@/lib/config';
import { storage } from '@/lib/storage';
import { translate, type TranslationKey } from '@/i18n/config';
import type { Language } from '@/i18n/types';

interface Ctx { language: Language; setLanguage: (l: Language) => void; t: (key: TranslationKey) => string }
const LanguageCtx = createContext<Ctx | null>(null);
const KEY = 'bonayon:lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // TODO: confirm whether language is also stored on the user profile server-side.
  const [language, setState] = useState<Language>(() => {
    const v = storage.get(KEY);
    return v === 'en' || v === 'bn' ? v : config.defaultLanguage;
  });
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const setLanguage = useCallback((l: Language) => { setState(l); storage.set(KEY, l); }, []);
  const value = useMemo(() => ({ language, setLanguage, t: (k: TranslationKey) => translate(language, k) }), [language, setLanguage]);
  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export function useLanguage(): Ctx {
  const v = useContext(LanguageCtx);
  if (!v) throw new Error('useLanguage must be used inside LanguageProvider');
  return v;
}
