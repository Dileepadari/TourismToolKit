'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { en, isSupportedLocale, loadLocale } from '@/locales';
import type { SupportedLocale, TranslationKeys } from '@/locales';

export interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  selectedLanguage: string;
  supportedLanguages: Language[];
  setSelectedLanguage: (language: string) => void;
  currentLanguage: Language;
  /** Messages for the selected locale; English until the chunk has loaded. */
  messages: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'mr', name: 'मराठी' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'اردو' },
  { code: 'as', name: 'অসমীয়া' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'selected-language';

/**
 * localStorage as an external store.
 *
 * `useSyncExternalStore` is React's primitive for exactly this: it returns the
 * server snapshot ('en') during prerender and the stored value on the client,
 * without the read-then-setState-in-an-effect pattern that costs an extra render
 * on every page load.
 */
const languageStore = {
  subscribe(onChange: () => void) {
    // `storage` fires for other tabs; the custom event covers this one.
    window.addEventListener('storage', onChange);
    window.addEventListener('language-change', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('language-change', onChange);
    };
  },
  getSnapshot(): string {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && DEFAULT_LANGUAGES.some((lang) => lang.code === stored) ? stored : 'en';
  },
  getServerSnapshot(): string {
    return 'en';
  },
  set(language: string) {
    window.localStorage.setItem(STORAGE_KEY, language);
    window.dispatchEvent(new Event('language-change'));
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [supportedLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const selectedLanguage = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot,
  );

  const setSelectedLanguage = (language: string) => {
    languageStore.set(language);
  };

  // Locales other than English are separate chunks, fetched when first selected.
  // Until one arrives `t()` falls back to English rather than showing raw keys.
  const [messages, setMessages] = useState<TranslationKeys>(en);

  useEffect(() => {
    let cancelled = false;

    // The store only ever yields a supported locale (unknown values fall back to
    // 'en'), so there is no synchronous branch here - just the async load, whose
    // result is stored when it arrives.
    const locale: SupportedLocale = isSupportedLocale(selectedLanguage)
      ? selectedLanguage
      : 'en';

    void loadLocale(locale).then((loaded) => {
      if (!cancelled) setMessages(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedLanguage]);

  const currentLanguage = supportedLanguages.find(lang => lang.code === selectedLanguage) || supportedLanguages[0];

  const value: LanguageContextType = {
    selectedLanguage,
    supportedLanguages,
    setSelectedLanguage,
    currentLanguage,
    messages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};