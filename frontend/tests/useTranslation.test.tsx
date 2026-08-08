import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { en } from '@/locales';
import { SUPPORTED_LOCALES, loadLocale } from '@/locales';
import type { SupportedLocale } from '@/locales';

function flatten(node: unknown, prefix = ''): string[] {
  if (typeof node !== 'object' || node === null) return [prefix];
  return Object.entries(node).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  );
}

const englishKeys = flatten(en);

describe('locale key parity', () => {
  // Ten of the thirteen locales were missing ~61 keys each, which silently fell
  // back to English. The NestedKeyOf type only ever checked `en`, so nothing caught it.
  it.each(SUPPORTED_LOCALES)('%s has every key that en has', async (locale) => {
    const messages = await loadLocale(locale as SupportedLocale);
    const keys = new Set(flatten(messages));
    expect(englishKeys.filter((key) => !keys.has(key))).toEqual([]);
  });

  it.each(SUPPORTED_LOCALES)('%s has no keys en lacks', async (locale) => {
    const messages = await loadLocale(locale as SupportedLocale);
    const english = new Set(englishKeys);
    expect(flatten(messages).filter((key) => !english.has(key))).toEqual([]);
  });

  it('covers all thirteen advertised languages', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(13);
  });

  it.each(SUPPORTED_LOCALES)('%s has no empty strings', async (locale) => {
    const messages = await loadLocale(locale as SupportedLocale);
    const walk = (node: unknown, path: string): void => {
      if (typeof node === 'string') {
        expect(node.trim(), `${locale}.${path} is empty`).not.toBe('');
        return;
      }
      if (typeof node === 'object' && node !== null) {
        for (const [key, value] of Object.entries(node)) {
          walk(value, path ? `${path}.${key}` : key);
        }
      }
    };
    walk(messages, '');
  });
});

describe('useTranslation', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  it('returns the English string by default', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('nav.home')).toBe('Home');
  });

  it('resolves nested keys', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('guide.culturalTips')).toBe('Cultural Tips');
  });

  it('returns the key itself when it does not exist', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    // @ts-expect-error deliberately probing an unknown key
    expect(result.current.t('does.not.exist')).toBe('does.not.exist');
  });

  it('uses the stored language', () => {
    localStorage.setItem('selected-language', 'hi');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('hi');
    // The Hindi chunk loads asynchronously, so the first render is still English.
    expect(result.current.t('nav.home')).toBe(en.nav.home);
  });

  it('ignores an unsupported stored language', () => {
    localStorage.setItem('selected-language', 'klingon');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('en');
  });
});
