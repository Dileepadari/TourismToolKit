import { useLanguage } from '@/providers/LanguageProvider';
import { translations, SupportedLocale } from '@/locales';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof translations.en>;

export function useTranslation() {
  const { selectedLanguage } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    const locale = selectedLanguage as SupportedLocale;
    const keys = key.split('.');
    
    let translation: any = translations[locale] || translations.en;
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        let fallback: any = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object') {
            fallback = fallback[fk];
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof translation === 'string' ? translation : key;
  };
  
  return { t, locale: selectedLanguage };
}
