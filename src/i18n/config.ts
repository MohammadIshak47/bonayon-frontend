import bnAuth from './locales/bn/auth.json';
import bnLanding from './locales/bn/landing.json';
import bnCommon from './locales/bn/common.json';
import bnNavigation from './locales/bn/navigation.json';
import bnValidation from './locales/bn/validation.json';
import enAuth from './locales/en/auth.json';
import enLanding from './locales/en/landing.json';
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enValidation from './locales/en/validation.json';
import type { Language } from './types';

const dictionaries = {
  en: { common: enCommon, navigation: enNavigation, validation: enValidation, auth: enAuth, landing: enLanding },
  bn: { common: bnCommon, navigation: bnNavigation, validation: bnValidation, auth: bnAuth, landing: bnLanding },
};

/** Keys come from the English files, so a typo in a component fails the typecheck. */
export type TranslationKey =
  | `common.${keyof typeof enCommon}`
  | `navigation.${keyof typeof enNavigation}`
  | `validation.${keyof typeof enValidation}`
  | `auth.${keyof typeof enAuth}`
  | `landing.${keyof typeof enLanding}`;

export function translate(lang: Language, key: TranslationKey): string {
  const [ns, k] = key.split('.') as [keyof typeof dictionaries.en, string];
  const lookup = (l: Language) => (dictionaries[l][ns] as Record<string, string>)[k];
  return lookup(lang) ?? lookup('en') ?? key; // missing Bangla falls back to English
}
export { dictionaries };
