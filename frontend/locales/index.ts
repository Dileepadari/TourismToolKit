import { en } from './en';
import type { TranslationKeys } from './en';

/**
 * Locale loading.
 *
 * English is imported statically because it is both the default and the fallback
 * for any key a translation is missing. The other twelve are loaded on demand -
 * previously all thirteen were bundled into every page, so a visitor downloaded
 * ~3,200 lines of translations to read one language.
 */
export const SUPPORTED_LOCALES = [
  'en',
  'hi',
  'te',
  'ta',
  'kn',
  'ml',
  'bn',
  'gu',
  'mr',
  'pa',
  'ur',
  'as',
  'or',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// Webpack/Turbopack need a statically analysable import to split these into
// separate chunks, hence the explicit map rather than a template literal.
const loaders: Record<SupportedLocale, () => Promise<{ default: TranslationKeys }>> = {
  en: async () => ({ default: en }),
  hi: () => import('./hi').then((m) => ({ default: m.hi })),
  te: () => import('./te').then((m) => ({ default: m.te })),
  ta: () => import('./ta').then((m) => ({ default: m.ta })),
  kn: () => import('./kn').then((m) => ({ default: m.kn })),
  ml: () => import('./ml').then((m) => ({ default: m.ml })),
  bn: () => import('./bn').then((m) => ({ default: m.bn })),
  gu: () => import('./gu').then((m) => ({ default: m.gu })),
  mr: () => import('./mr').then((m) => ({ default: m.mr })),
  pa: () => import('./pa').then((m) => ({ default: m.pa })),
  ur: () => import('./ur').then((m) => ({ default: m.ur })),
  as: () => import('./as').then((m) => ({ default: m.as })),
  or: () => import('./or').then((m) => ({ default: m.or })),
};

const cache = new Map<SupportedLocale, TranslationKeys>([['en', en]]);

/** Load a locale's messages, caching the result for the session. */
export async function loadLocale(locale: SupportedLocale): Promise<TranslationKeys> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const messages = (await loaders[locale]()).default;
  cache.set(locale, messages);
  return messages;
}

/** Synchronously available messages, or undefined if not loaded yet. */
export function getLoadedLocale(locale: SupportedLocale): TranslationKeys | undefined {
  return cache.get(locale);
}

export { en };
export type { TranslationKeys };
